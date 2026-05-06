'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { createCvSchema } from '@/lib/schemas/admin';
import { revalidatePath } from 'next/cache';

export type ActionResult = {
  success?: boolean;
  error?: string;
  data?: unknown;
};

export async function uploadCvAction(payload: Record<string, unknown>): Promise<ActionResult> {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return { error: 'Non autorisé' };

  try {
    const validation = createCvSchema.safeParse(payload);
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const { url, public_id, resource_type, size } = validation.data;

    // Best-effort cleanup of old CVs on Cloudinary
    const oldCvs = await prisma.cv.findMany();
    for (const old of oldCvs) {
      if (old.public_id !== public_id) {
        await deleteFromCloudinary(old.public_id, old.resource_type);
      }
    }

    // Atomically replace record
    await prisma.$transaction(async (tx) => {
      await tx.cv.deleteMany({});
      await tx.cv.create({
        data: {
          url,
          public_id,
          resource_type: resource_type || 'image',
          size: size || 'Document PDF',
        },
      });
    });

    revalidatePath('/admin/cv');
    revalidatePath('/');
    revalidatePath('/api/cv');
    return { success: true, data: { url, name: 'CV_OKBA_Hedi.pdf' } };
  } catch (error) {
    console.error('[actions/cv:upload]', error);
    return { error: "Erreur lors de l'enregistrement du fichier." };
  }
}

export async function deleteCvAction(): Promise<ActionResult> {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return { error: 'Non autorisé' };

  try {
    const oldCvs = await prisma.cv.findMany();
    for (const old of oldCvs) {
      await deleteFromCloudinary(old.public_id, old.resource_type);
    }

    await prisma.cv.deleteMany();

    revalidatePath('/admin/cv');
    revalidatePath('/');
    revalidatePath('/api/cv');
    return { success: true };
  } catch (error) {
    console.error('[actions/cv:delete]', error);
    return { error: 'Erreur lors de la suppression.' };
  }
}

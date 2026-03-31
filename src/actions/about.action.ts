'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { updateAboutSchema } from '@/lib/schemas/admin';
import type { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export type AboutState = {
  success?: boolean;
  error?: string;
};

// formData is used if we passed actual FormData, but since we are handling a custom array of objects (techs, stats),
// we will receive a direct payload from the client action.
export async function updateAboutAction(payload: Record<string, unknown>): Promise<AboutState> {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return { error: 'Non autorisé' };

  try {
    const validation = updateAboutSchema.safeParse(payload);
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const { bio, stats, techs } = validation.data;

    let aboutMe = await prisma.aboutMe.findFirst();

    if (!aboutMe) {
      aboutMe = await prisma.aboutMe.create({
        data: { bio: '', stats: [] },
      });
    }

    // Atomic: delete old techs + recreate in a single transaction
    await prisma.$transaction(async (tx) => {
      await tx.aboutMeTech.deleteMany({ where: { aboutMeId: aboutMe!.id } });

      return tx.aboutMe.update({
        where: { id: aboutMe!.id },
        data: {
          bio: bio ?? aboutMe!.bio,
          stats: (stats as Prisma.InputJsonValue) ?? aboutMe!.stats,
          techs: {
            create:
              techs?.map((tech: Record<string, unknown>, index: number) => ({
                name: tech.name as string,
                icon: (tech.icon as string) || null,
                color: (tech.color as string) || '#00D5BE',
                order: index,
              })) ?? [],
          },
        },
      });
    });

    // Revalidate the about page so that the next request gets fresh data
    revalidatePath('/admin/about');
    revalidatePath('/'); // Revalidate public home page since it uses About info too

    return { success: true };
  } catch (error) {
    console.error('[actions/about]', error);
    return { error: 'Erreur serveur lors de la sauvegarde.' };
  }
}

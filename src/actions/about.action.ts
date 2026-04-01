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

// Direct payload from client action
export async function updateAboutAction(payload: Record<string, unknown>): Promise<AboutState> {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return { error: 'Unauthorized' };

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

    // Atomic tech replacement
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

    revalidatePath('/admin/about');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('[actions/about]', error);
    return { error: 'Server error during save.' };
  }
}

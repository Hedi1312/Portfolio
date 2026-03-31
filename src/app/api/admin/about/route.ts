import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { updateAboutSchema } from '@/lib/schemas/admin';
import type { Prisma } from '@prisma/client';

// GET -> Returns 'About' singleton
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    let aboutMe = await prisma.aboutMe.findFirst({
      include: { techs: { orderBy: { order: 'asc' } } },
    });

    // Create empty record if none exists
    if (!aboutMe) {
      aboutMe = await prisma.aboutMe.create({
        data: { bio: '', stats: [] },
        include: { techs: { orderBy: { order: 'asc' } } },
      });
    }

    return NextResponse.json(aboutMe);
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// PUT → Update the 'About' singleton
export async function PUT(req: Request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();

    const validation = updateAboutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { bio, stats, techs } = validation.data;

    // Find existing singleton
    let aboutMe = await prisma.aboutMe.findFirst();

    if (!aboutMe) {
      aboutMe = await prisma.aboutMe.create({
        data: { bio: '', stats: [] },
      });
    }

    // Recreate old techs
    await prisma.aboutMeTech.deleteMany({ where: { aboutMeId: aboutMe.id } });

    const updated = await prisma.aboutMe.update({
      where: { id: aboutMe.id },
      data: {
        bio: bio ?? aboutMe.bio,
        stats: (stats as Prisma.InputJsonValue) ?? aboutMe.stats,
        techs: {
          create:
            techs?.map((tech, index: number) => ({
              name: tech.name,
              icon: tech.icon || null,
              color: tech.color || '#00D5BE',
              order: index,
            })) ?? [],
        },
      },
      include: { techs: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json(updated);
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

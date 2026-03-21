import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET → Retourne le singleton « À propos »
export async function GET() {
  try {
    let aboutMe = await prisma.aboutMe.findFirst({
      include: { techs: { orderBy: { order: 'asc' } } },
    });

    // Si aucun enregistrement n'existe, en créer un vide
    if (!aboutMe) {
      aboutMe = await prisma.aboutMe.create({
        data: { bio: '', stats: [] },
        include: { techs: { orderBy: { order: 'asc' } } },
      });
    }

    return NextResponse.json(aboutMe);
  } catch (error) {
    console.error('Erreur récupération à propos:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// PUT → Met à jour le singleton « À propos »
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { bio, stats, techs } = body;

    // Trouver le singleton existant
    let aboutMe = await prisma.aboutMe.findFirst();

    if (!aboutMe) {
      aboutMe = await prisma.aboutMe.create({
        data: { bio: '', stats: [] },
      });
    }

    // Supprimer les anciennes techs et les recréer
    await prisma.aboutMeTech.deleteMany({ where: { aboutMeId: aboutMe.id } });

    const updated = await prisma.aboutMe.update({
      where: { id: aboutMe.id },
      data: {
        bio: bio ?? aboutMe.bio,
        stats: stats ?? aboutMe.stats,
        techs: {
          create:
            techs?.map((tech: { name: string; icon?: string; color?: string }, index: number) => ({
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
  } catch (error) {
    console.error('Erreur mise à jour à propos:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

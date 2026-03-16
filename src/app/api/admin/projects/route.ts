import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET → Récupérer tous les projets (avec skills), ordonnés
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { 
        skills: true,
        images: { orderBy: { order: 'asc' } }
      },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erreur récupération projets:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// POST → Créer un projet
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, gradient, link, github, visible, skills } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Titre et description requis.' }, { status: 400 });
    }

    // Récupérer le plus grand order actuel
    const maxOrder = await prisma.project.aggregate({ _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        gradient: gradient || undefined,
        link: link || null,
        github: github || null,
        visible: visible ?? true,
        order: nextOrder,
        skills: {
          create:
            skills?.map((s: { name: string; icon?: string; color?: string }) => ({
              name: s.name,
              icon: s.icon || null,
              color: s.color || '#00D5BE',
            })) ?? [],
        },
      },
      include: { skills: true, images: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Erreur création projet:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

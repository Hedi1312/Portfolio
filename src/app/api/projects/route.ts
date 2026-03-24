import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET → Projets visibles (route publique pour le portfolio)
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { visible: true },
      include: {
        skills: true,
        images: { orderBy: { order: 'asc' } },
      },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erreur récupération projets:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

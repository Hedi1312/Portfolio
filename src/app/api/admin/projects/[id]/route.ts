import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';

// PUT -> Update project
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, gradient, link, github, visible, order, skills } = body;

    // Recreate old skills
    await prisma.projectSkill.deleteMany({ where: { projectId: id } });

    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        gradient: gradient || undefined,
        link: link || null,
        github: github || null,
        visible: visible ?? true,
        order: order ?? undefined,
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

    return NextResponse.json(project);
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// DELETE -> Remove project
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Get project with images
    const project = await prisma.project.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Projet déjà supprimé ou introuvable.' }, { status: 404 });
    }

    if (project.images.length > 0) {
      await Promise.all(
        project.images.map((img: { public_id: string; url: string }) => {
          const isVideo = /\.(mp4|webm|mov|avi)$/i.test(img.url);
          return deleteFromCloudinary(img.public_id, isVideo ? 'video' : 'image');
        }),
      );
    }

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

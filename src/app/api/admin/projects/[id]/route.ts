import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/auth-guard';
import { updateProjectSchema } from '@/lib/schemas/admin';

// PUT -> Update project
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = await req.json();

    const validation = updateProjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { title, description, gradient, link, github, visible, order, skills } = validation.data;

    // Atomic: delete old skills + recreate in a single transaction
    const project = await prisma.$transaction(async (tx) => {
      await tx.projectSkill.deleteMany({ where: { projectId: id } });

      return tx.project.update({
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
              skills?.map((s) => ({
                name: s.name,
                icon: s.icon || null,
                color: s.color || '#00D5BE',
              })) ?? [],
          },
        },
        include: { skills: true, images: { orderBy: { order: 'asc' } } },
      });
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('[api/admin/projects/[id]:PUT]', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

// DELETE -> Remove project
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

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
  } catch (error) {
    console.error('[api/admin/projects/[id]:DELETE]', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

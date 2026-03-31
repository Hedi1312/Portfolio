import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { addProjectImagesSchema } from '@/lib/schemas/admin';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });

    const body = await req.json();

    const validation = addProjectImagesSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { images } = validation.data;

    const uploadedImages = [];

    // Determine order
    const maxOrderRes = await prisma.projectImage.aggregate({
      where: { projectId: id },
      _max: { order: true },
    });
    let nextOrder = (maxOrderRes._max.order ?? -1) + 1;

    for (const img of images) {
      const projectImage = await prisma.projectImage.create({
        data: {
          url: img.url,
          public_id: img.public_id,
          order: nextOrder++,
          projectId: id,
        },
      });

      uploadedImages.push(projectImage);
    }

    return NextResponse.json({ success: true, images: uploadedImages }, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

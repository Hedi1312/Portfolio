import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface UploadedImage {
  url: string;
  public_id: string;
  resource_type: string;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Vérifier l'existence du projet
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });

    const body = await req.json();
    const images: UploadedImage[] = body.images;

    if (!images || images.length === 0) {
      return NextResponse.json({ error: 'Aucune image fournie' }, { status: 400 });
    }

    // Vérifier que chaque image a les champs requis
    for (const img of images) {
      if (!img.url || !img.public_id) {
        return NextResponse.json(
          { error: 'Chaque image doit avoir un url et un public_id.' },
          { status: 400 },
        );
      }
    }

    const uploadedImages = [];

    // Déterminer l'ordre (le max actuel + 1)
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

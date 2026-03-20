import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Vérifier l'existence du projet
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const uploadedImages = [];

    // Déterminer l'ordre (le max actuel + 1)
    const maxOrderRes = await prisma.projectImage.aggregate({
      where: { projectId: id },
      _max: { order: true },
    });
    let nextOrder = (maxOrderRes._max.order ?? -1) + 1;

    for (const file of files) {
      if (file.size > 100 * 1024 * 1024) {
        return NextResponse.json(
          { error: `Fichier ${file.name} trop volumineux (max 100Mo).` },
          { status: 400 },
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploaded = await uploadToCloudinary(buffer, file.name, 'projets');

      const projectImage = await prisma.projectImage.create({
        data: {
          url: uploaded.url,
          public_id: uploaded.public_id,
          order: nextOrder++,
          projectId: id,
        },
      });

      uploadedImages.push(projectImage);
    }

    return NextResponse.json({ success: true, images: uploadedImages }, { status: 201 });
  } catch (error) {
    console.error('Erreur upload images projet:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

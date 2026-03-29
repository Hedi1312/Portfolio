import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';

// GET -> Returns public CV URL
export async function GET() {
  try {
    const cv = await prisma.cv.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!cv) {
      return NextResponse.json({ url: null, size: null, name: null });
    }

    return NextResponse.json({
      url: cv.url,
      size: cv.size || 'Document PDF',
      name: 'CV_OKBA_Hedi.pdf',
    });
  } catch (_err) {
    return NextResponse.json({ url: null, size: null, name: null });
  }
}

// POST → enregistre les métadonnées du CV uploadé directement vers Cloudinary
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, public_id, resource_type, size } = body;

    if (!url || !public_id) {
      return NextResponse.json(
        { error: 'Les champs url et public_id sont requis.' },
        { status: 400 },
      );
    }

    // Handle old CV deletion
    const oldCvs = await prisma.cv.findMany();
    for (const old of oldCvs) {
      if (old.public_id !== public_id) {
        await deleteFromCloudinary(old.public_id, old.resource_type);
      }
    }

    // On vide la table pour n'avoir qu'un seul CV
    await prisma.cv.deleteMany();

    // Save to DB
    const newCv = await prisma.cv.create({
      data: {
        url,
        public_id,
        resource_type: resource_type || 'image',
        size: size || 'Document PDF',
      },
    });

    return NextResponse.json({
      success: true,
      url: newCv.url,
      name: 'CV_OKBA_Hedi.pdf',
      message: 'CV mis à jour sur Cloudinary avec succès.',
    });
  } catch (_err) {
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement du fichier." },
      { status: 500 },
    );
  }
}

// DELETE → supprime complètement le CV
export async function DELETE() {
  try {
    const oldCvs = await prisma.cv.findMany();
    for (const old of oldCvs) {
      await deleteFromCloudinary(old.public_id, old.resource_type);
    }

    await prisma.cv.deleteMany();

    return NextResponse.json({
      success: true,
      message: 'CV supprimé avec succès.',
    });
  } catch (_err) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}

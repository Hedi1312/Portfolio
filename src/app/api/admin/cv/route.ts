import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

// GET → renvoie l'URL publique du CV depuis la DB
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
      // On ne stocke pas la taille en DB pour l'instant, mais on pourrait le faire
      size: 'Document PDF',
      name: 'CV_OKBA_Hedi.pdf',
    });
  } catch (err) {
    console.error('Erreur récupération CV:', err);
    return NextResponse.json({ url: null, size: null, name: null });
  }
}

// POST → upload du nouveau CV vers Cloudinary
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni.' }, { status: 400 });
    }

    if (!file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Le fichier doit être au format PDF.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Upload vers Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, 'CV_OKBA_Hedi.pdf', 'cv');

    // 2. Gestion de l'ancien CV (suppression optionnelle si on veut garder une seule entrée)
    const oldCvs = await prisma.cv.findMany();
    for (const old of oldCvs) {
      await deleteFromCloudinary(old.public_id);
    }

    // On vide la table pour n'avoir qu'un seul CV (ou on pourrait simplement filtrer au GET)
    await prisma.cv.deleteMany();

    // 3. Sauvegarder en DB
    const newCv = await prisma.cv.create({
      data: {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
      },
    });

    return NextResponse.json({
      success: true,
      url: newCv.url,
      name: file.name,
      message: 'CV mis à jour sur Cloudinary avec succès.',
    });
  } catch (err) {
    console.error('Erreur upload CV:', err);
    return NextResponse.json(
      { error: 'Erreur lors de l’enregistrement du fichier.' },
      { status: 500 },
    );
  }
}

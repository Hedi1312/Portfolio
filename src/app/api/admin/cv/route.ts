import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { PDFDocument } from 'pdf-lib';

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
      size: cv.size || 'Document PDF',
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

    // Modification des métadonnées internes du PDF
    const pdfDoc = await PDFDocument.load(bytes);
    pdfDoc.setTitle('CV_OKBA_Hedi');
    pdfDoc.setAuthor('Hedi OKBA');
    pdfDoc.setSubject('Curriculum Vitae');
    pdfDoc.setProducer('Portfolio Hedi OKBA');
    pdfDoc.setCreator('Portfolio Hedi OKBA');

    const modifiedPdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(modifiedPdfBytes);
    const sizeStr = (modifiedPdfBytes.length / 1024).toFixed(1) + ' Ko';

    // 1. Upload vers Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, 'CV_OKBA_Hedi.pdf', 'cv');

    // 2. Gestion de l'ancien CV (suppression avec le bon resource_type)
    const oldCvs = await prisma.cv.findMany();
    for (const old of oldCvs) {
      if (old.public_id !== uploadResult.public_id) {
        await deleteFromCloudinary(old.public_id, old.resource_type);
      }
    }

    // On vide la table pour n'avoir qu'un seul CV
    await prisma.cv.deleteMany();

    // 3. Sauvegarder en DB avec le resource_type et size
    const newCv = await prisma.cv.create({
      data: {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
        resource_type: uploadResult.resource_type,
        size: sizeStr,
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
  } catch (err) {
    console.error('Erreur suppression CV:', err);
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}

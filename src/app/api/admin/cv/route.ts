import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/auth-guard';
import { createCvSchema } from '@/lib/schemas/admin';

// GET -> Returns public CV URL
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

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

// POST → Save CV metadata after direct Cloudinary upload
export async function POST(req: Request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();

    const validation = createCvSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { url, public_id, resource_type, size } = validation.data;

    // Handle old CV deletion
    const oldCvs = await prisma.cv.findMany();
    for (const old of oldCvs) {
      if (old.public_id !== public_id) {
        await deleteFromCloudinary(old.public_id, old.resource_type);
      }
    }

    // Keep only one CV record
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

// DELETE → Remove the CV entirely
export async function DELETE() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

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

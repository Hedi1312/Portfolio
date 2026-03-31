import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/auth-guard';
import { updateImageOrderSchema } from '@/lib/schemas/admin';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id, imageId } = await params;

    const image = await prisma.projectImage.findUnique({
      where: { id: imageId, projectId: id },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image introuvable' }, { status: 404 });
    }

    // Determine media type for Cloudinary
    const isVideo = image.url.match(/\.(mp4|webm|mov|avi|mkv)$/i);
    const resourceType = isVideo ? 'video' : 'image';

    // Remove from Cloudinary
    await deleteFromCloudinary(image.public_id, resourceType);

    // Remove from DB
    await prisma.projectImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id, imageId } = await params;
    const body = await req.json();

    const validation = updateImageOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const image = await prisma.projectImage.update({
      where: { id: imageId, projectId: id },
      data: {
        order: validation.data.order,
      },
    });

    return NextResponse.json({ success: true, image });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

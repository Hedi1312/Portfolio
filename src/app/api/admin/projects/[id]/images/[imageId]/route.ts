import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> },
) {
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
  try {
    const { id, imageId } = await params;
    const body = await req.json();

    const image = await prisma.projectImage.update({
      where: { id: imageId, projectId: id },
      data: {
        order: body.order,
      },
    });

    return NextResponse.json({ success: true, image });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

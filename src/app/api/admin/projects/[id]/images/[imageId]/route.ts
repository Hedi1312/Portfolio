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

    // Retirer de Cloudinary
    await deleteFromCloudinary(image.public_id);

    // Retirer de la DB
    await prisma.projectImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'image:", error);
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
  } catch (error) {
    console.error("Erreur lors de la modification de l'image:", error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

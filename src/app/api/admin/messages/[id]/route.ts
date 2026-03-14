import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH → Marquer un message comme lu
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const message = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
    return NextResponse.json(message);
  } catch (error) {
    console.error('Erreur mise à jour message:', error);
    return NextResponse.json({ error: 'Message introuvable.' }, { status: 404 });
  }
}

// DELETE → Supprimer un message
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.contactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression message:', error);
    return NextResponse.json({ error: 'Message introuvable.' }, { status: 404 });
  }
}

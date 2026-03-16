import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';

// PATCH → Marquer tous les messages d'un contact comme lus
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.contactMessage.updateMany({
      where: { contactId: id, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour messages:', error);
    return NextResponse.json({ error: 'Contact introuvable.' }, { status: 404 });
  }
}

// DELETE → Supprimer un contact et tous ses messages
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Récupérer le contact avec tous les messages et réponses pour trouver les pièces jointes
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        messages: {
          include: { replies: true },
        },
      },
    });

    if (contact) {
      // Collecter tous les chemins de fichiers à supprimer
      const filesToDelete: string[] = [];

      contact.messages.forEach((msg) => {
        // Obtenir pièces jointes du message de base
        if (msg.attachments && typeof msg.attachments === 'object') {
          const baseAttachments = msg.attachments as { path?: string }[];
          if (Array.isArray(baseAttachments)) {
            baseAttachments.forEach((a) => {
              if (a.path && typeof a.path === 'string' && a.path.startsWith('/api/messages/')) {
                filesToDelete.push(a.path.replace('/api/messages/', ''));
              }
            });
          }
        }

        // Obtenir pièces jointes des réponses admin
        msg.replies.forEach((rep) => {
          if (rep.attachments && typeof rep.attachments === 'object') {
            const replyAttachments = rep.attachments as { path?: string }[];
            if (Array.isArray(replyAttachments)) {
              replyAttachments.forEach((a) => {
                if (a.path && typeof a.path === 'string' && a.path.startsWith('/api/messages/')) {
                  filesToDelete.push(a.path.replace('/api/messages/', ''));
                }
              });
            }
          }
        });
      });

      // Supprimer physiquement les fichiers du disque
      const uploadsDir = path.join(process.cwd(), 'storage', 'messages');
      await Promise.allSettled(
        filesToDelete.map((filename) => unlink(path.join(uploadsDir, filename))),
      );
    }

    // Supprimer la conversation de la base (Cascade supprimera messages et réponses)
    await prisma.contact.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression contact:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}

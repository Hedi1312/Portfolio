import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';

// PATCH -> Mark all contact messages as read
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.contactMessage.updateMany({
      where: { contactId: id, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'Contact introuvable.' }, { status: 404 });
  }
}

// DELETE -> Remove contact and their messages
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Get contact with messages and replies
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        messages: {
          include: { replies: true },
        },
      },
    });

    if (contact) {
      // Collecter tous les public_id Cloudinary à supprimer
      const publicIdsToDelete: string[] = [];

      contact.messages.forEach(
        (msg: { attachments: unknown; replies: { attachments: unknown }[] }) => {
          // Obtenir pièces jointes du message de base
          if (msg.attachments && typeof msg.attachments === 'object') {
            const baseAttachments = msg.attachments as { public_id?: string }[];
            if (Array.isArray(baseAttachments)) {
              baseAttachments.forEach((a) => {
                if (a.public_id && typeof a.public_id === 'string') {
                  publicIdsToDelete.push(a.public_id);
                }
              });
            }
          }

          // Obtenir pièces jointes des réponses admin
          msg.replies.forEach((rep: { attachments: unknown }) => {
            if (rep.attachments && typeof rep.attachments === 'object') {
              const replyAttachments = rep.attachments as { public_id?: string }[];
              if (Array.isArray(replyAttachments)) {
                replyAttachments.forEach((a) => {
                  if (a.public_id && typeof a.public_id === 'string') {
                    publicIdsToDelete.push(a.public_id);
                  }
                });
              }
            }
          });
        },
      );

      // Delete Cloudinary files
      await Promise.allSettled(
        publicIdsToDelete.map((public_id) => deleteFromCloudinary(public_id)),
      );
    }

    // Remove conversation from DB
    await prisma.contact.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}

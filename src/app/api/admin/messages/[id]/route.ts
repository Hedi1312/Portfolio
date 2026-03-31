import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/auth-guard';
import { z } from 'zod';

const idSchema = z.string().cuid('Invalid ID format');

// PATCH -> Mark all contact messages as read
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const validation = idSchema.safeParse(id);
    if (!validation.success) {
      return NextResponse.json({ error: 'ID invalide.' }, { status: 400 });
    }

    await prisma.contactMessage.updateMany({
      where: { contactId: id, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/admin/messages/[id]:PATCH]', error);
    return NextResponse.json({ error: 'Contact introuvable.' }, { status: 404 });
  }
}

// DELETE -> Remove contact and their messages
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const validation = idSchema.safeParse(id);
    if (!validation.success) {
      return NextResponse.json({ error: 'ID invalide.' }, { status: 400 });
    }

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
      // Collect all Cloudinary public_ids to delete
      const publicIdsToDelete: string[] = [];

      contact.messages.forEach(
        (msg: { attachments: unknown; replies: { attachments: unknown }[] }) => {
          // Get base message attachments
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

          // Get reply attachments
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
  } catch (error) {
    console.error('[api/admin/messages/[id]:DELETE]', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}

'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { render } from '@react-email/components';
import { AdminReply } from '@/emails/AdminReply';
import { transporter, getEmailSubjectPrefix } from '@/lib/mailer';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const idSchema = z.string().cuid('Invalid ID format');

// Allowed MIME types for attachments
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

export type ActionResult = {
  success?: boolean;
  error?: string;
  data?: unknown;
};

export async function markAsReadAction(contactId: string): Promise<ActionResult> {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return { error: 'Non autorisé' };

  try {
    const validation = idSchema.safeParse(contactId);
    if (!validation.success) return { error: 'ID invalide' };

    await prisma.contactMessage.updateMany({
      where: { contactId, isRead: false },
      data: { isRead: true },
    });

    revalidatePath('/admin/messages');
    return { success: true };
  } catch (error) {
    console.error('[actions/message:markAsRead]', error);
    return { error: 'Erreur serveur.' };
  }
}

export async function deleteContactAction(contactId: string): Promise<ActionResult> {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return { error: 'Non autorisé' };

  try {
    const validation = idSchema.safeParse(contactId);
    if (!validation.success) return { error: 'ID invalide' };

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        messages: {
          include: { replies: true },
        },
      },
    });

    if (contact) {
      const publicIdsToDelete: string[] = [];

      contact.messages.forEach((msg) => {
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

        msg.replies.forEach((rep) => {
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
      });

      // Delete Cloudinary files
      await Promise.allSettled(
        publicIdsToDelete.map((public_id) => deleteFromCloudinary(public_id)),
      );
    }

    // Remove from DB cascade
    await prisma.contact.delete({ where: { id: contactId } });

    revalidatePath('/admin/messages');
    return { success: true };
  } catch (error) {
    console.error('[actions/message:delete]', error);
    return { error: 'Erreur lors de la suppression.' };
  }
}

export async function sendReplyAction(
  contactId: string,
  formData: FormData,
): Promise<ActionResult> {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return { error: 'Non autorisé' };

  try {
    const validation = idSchema.safeParse(contactId);
    if (!validation.success) return { error: 'ID invalide' };

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!contact || contact.messages.length === 0) {
      return { error: 'Contact introuvable' };
    }

    const lastMessage = contact.messages[0];
    const replyMessage = formData.get('message') as string;

    if (!replyMessage || replyMessage.trim() === '') {
      return { error: 'Le message est vide.' };
    }

    // Save attachments to Cloudinary
    const emailAttachments = [];
    const dbAttachments: { filename: string; path: string; public_id?: string }[] = [];
    const allFiles = formData.getAll('files') as File[];
    const files = allFiles.slice(0, MAX_FILES);

    if (files.length > 0) {
      const { uploadToCloudinary } = await import('@/lib/cloudinary');

      for (const file of files) {
        if (file && file.size > 0) {
          if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return { error: `Le type du fichier "${file.name}" n'est pas autorisé.` };
          }

          if (file.size > MAX_FILE_SIZE) {
            return { error: `Le fichier "${file.name}" dépasse 10 Mo.` };
          }

          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Magic Bytes Validation
          const header = buffer.toString('hex', 0, 4).toUpperCase();
          const isJpeg = header.startsWith('FFD8FF');
          const isPng = header === '89504E47';
          const isGif = header.startsWith('47494638');
          const isPdf = header === '25504446';
          const isWebp =
            header === '52494646' && buffer.toString('hex', 8, 12).toUpperCase() === '57454250';

          if (!isJpeg && !isPng && !isGif && !isPdf && !isWebp) {
            return { error: `Le contenu du fichier "${file.name}" est corrompu ou illicite.` };
          }

          const uploaded = await uploadToCloudinary(buffer, file.name, 'emails');

          emailAttachments.push({
            filename: file.name,
            content: buffer,
          });

          dbAttachments.push({
            filename: file.name,
            path: uploaded.url,
            public_id: uploaded.public_id,
          });
        }
      }
    }

    const prefixe = getEmailSubjectPrefix();

    const html = await render(
      AdminReply({
        recipientName: contact.name,
        replyMessage: replyMessage,
        originalSubject: lastMessage.subject || undefined,
        originalMessage: lastMessage.message,
      }),
    );

    const savedReply = await prisma.messageReply.create({
      data: {
        message: replyMessage,
        attachments: dbAttachments,
        contactMessageId: lastMessage.id,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: contact.email,
      subject: `${prefixe}Réponse à votre message — Hëdi OKBA`,
      html,
      attachments: emailAttachments,
    });

    await prisma.contactMessage.updateMany({
      where: { contactId, isRead: false },
      data: { isRead: true },
    });

    await prisma.contact.update({
      where: { id: contactId },
      data: { updatedAt: new Date() },
    });

    revalidatePath('/admin/messages');
    return { success: true, data: savedReply };
  } catch (error) {
    console.error('[actions/message:sendReply]', error);
    return { error: "Erreur serveur lors de l'envoi." };
  }
}

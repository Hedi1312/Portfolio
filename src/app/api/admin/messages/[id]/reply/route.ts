import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { render } from '@react-email/components';
import { AdminReply } from '@/emails/AdminReply';
import { requireAdmin } from '@/lib/auth-guard';
import { transporter, getEmailSubjectPrefix } from '@/lib/mailer';
import { replyMessageSchema } from '@/lib/schemas/admin';

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

// POST → Send a custom reply to a contact
// id = contactId
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;

    // Get contact and last message
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!contact || contact.messages.length === 0) {
      return NextResponse.json({ error: 'Contact introuvable.' }, { status: 404 });
    }

    const lastMessage = contact.messages[0];

    // Extract form data (message + attachments)
    const formData = await req.formData();
    const replyMessage = formData.get('message');

    // Validate message via Zod schema
    const validation = replyMessageSchema.safeParse({ message: replyMessage });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
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
          // Validate file type
          if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json(
              { error: `Le type du fichier "${file.name}" n'est pas autorisé.` },
              { status: 400 },
            );
          }

          // Validate file size
          if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
              { error: `Le fichier "${file.name}" dépasse la limite de 10 Mo.` },
              { status: 400 },
            );
          }

          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Upload to Cloudinary
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

    // Environment prefix
    const prefixe = getEmailSubjectPrefix();

    // Render email template
    const html = await render(
      AdminReply({
        recipientName: contact.name,
        replyMessage: validation.data.message,
        originalSubject: lastMessage.subject || undefined,
        originalMessage: lastMessage.message,
      }),
    );

    // Save reply to DB
    const savedReply = await prisma.messageReply.create({
      data: {
        message: validation.data.message,
        attachments: dbAttachments,
        contactMessageId: lastMessage.id,
      },
    });

    // Send the email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: contact.email,
      subject: `${prefixe}Réponse à votre message — Hëdi OKBA`,
      html,
      attachments: emailAttachments,
    });

    // Mark all messages as read
    await prisma.contactMessage.updateMany({
      where: { contactId: id, isRead: false },
      data: { isRead: true },
    });

    // Update contact timestamp
    await prisma.contact.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, reply: savedReply });
  } catch (error) {
    console.error('[api/admin/messages/[id]/reply]', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

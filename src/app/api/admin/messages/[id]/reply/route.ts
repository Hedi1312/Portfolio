import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { render } from '@react-email/components';
import { AdminReply } from '@/emails/AdminReply';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// POST → Envoyer une réponse personnalisée au contact
// id = contactId
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    // Extraire les données du formulaire (message + pièces jointes)
    const formData = await req.formData();
    const replyMessage = formData.get('message') as string;

    if (!replyMessage?.trim()) {
      return NextResponse.json({ error: 'Le message est requis.' }, { status: 400 });
    }

    // Save attachments to Cloudinary
    const emailAttachments = [];
    const dbAttachments: { filename: string; path: string; public_id?: string }[] = [];
    const files = formData.getAll('files') as File[];

    if (files.length > 0) {
      const { uploadToCloudinary } = await import('@/lib/cloudinary');

      for (const file of files) {
        if (file && file.size > 0) {
          if (file.size > 10 * 1024 * 1024) {
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
    let prefixe = '';
    if (process.env.VERCEL_ENV === 'preview') {
      prefixe = '[PREVIEW] ';
    } else if (!process.env.VERCEL_ENV) {
      prefixe = '[LOCAL] ';
    }

    // Rendre le template email
    const html = await render(
      AdminReply({
        recipientName: contact.name,
        replyMessage,
        originalSubject: lastMessage.subject || undefined,
        originalMessage: lastMessage.message,
      }),
    );

    // Save reply to DB
    const savedReply = await prisma.messageReply.create({
      data: {
        message: replyMessage,
        attachments: dbAttachments,
        contactMessageId: lastMessage.id,
      },
    });

    // Envoyer l'email
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
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

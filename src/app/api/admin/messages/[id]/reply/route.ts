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
// id = contactId (on répond à un contact, la réponse est liée au dernier message)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Récupérer le contact et son dernier message
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

    // Sauvegarder les pièces jointes sur Cloudinary
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

          // Upload vers Cloudinary
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

    // Préfixe environnement
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
      }),
    );

    // Sauvegarder la réponse en BDD avec pièces jointes
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

    // Marquer tous les messages comme lus
    await prisma.contactMessage.updateMany({
      where: { contactId: id, isRead: false },
      data: { isRead: true },
    });

    // Mettre à jour le timestamp du contact
    await prisma.contact.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, reply: savedReply });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

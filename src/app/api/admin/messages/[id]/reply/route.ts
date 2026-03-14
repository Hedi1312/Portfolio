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
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Récupérer le message original
    const original = await prisma.contactMessage.findUnique({ where: { id } });
    if (!original) {
      return NextResponse.json({ error: 'Message introuvable.' }, { status: 404 });
    }

    // Extraire les données du formulaire (message + pièces jointes)
    const formData = await req.formData();
    const replyMessage = formData.get('message') as string;

    if (!replyMessage?.trim()) {
      return NextResponse.json({ error: 'Le message est requis.' }, { status: 400 });
    }

    // Préparer les pièces jointes
    const attachments = [];
    const files = formData.getAll('files') as File[];
    for (const file of files) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        attachments.push({
          filename: file.name,
          content: Buffer.from(bytes),
        });
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
        recipientName: original.name,
        replyMessage,
      }),
    );

    // Envoyer l'email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: original.email,
      subject: `${prefixe}Réponse à votre message — Hëdi OKBA`,
      html,
      attachments,
    });

    // Marquer le message comme lu
    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });

    console.log(`📤 [REPLY] Réponse envoyée à : ${original.email}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur envoi réponse:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

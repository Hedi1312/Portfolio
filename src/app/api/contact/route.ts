import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { render } from '@react-email/components';

import { AdminNotification } from '@/emails/AdminNotification';
import { UserConfirmation } from '@/emails/UserConfirmation';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    const file = formData.get('file') as File | null;
    const honeypot = formData.get('company') as string;

    if (honeypot) return NextResponse.json({ success: true });

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs requis.' }, { status: 400 });
    }

    const attachments = [];
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      attachments.push({
        filename: file.name,
        content: buffer,
      });
    }

    const destinataire = process.env.ADMIN_MAIL as string;
    let prefixe = '';

    if (process.env.VERCEL_ENV === 'preview') {
      prefixe = '[PREVIEW] ';
    } else if (!process.env.VERCEL_ENV) {
      prefixe = '[LOCAL] ';
    }

    const subject = `${prefixe} - Nouveau message de ${name}`;

    const adminHtml = await render(AdminNotification({ name, email, message }));
    const userHtml = await render(UserConfirmation({ name }));

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: destinataire,
      replyTo: email,
      subject: subject,
      attachments,
      html: adminHtml,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `${prefixe} - Merci pour ton message !`,
      html: userHtml,
    });

    console.log(`📩 [ADMIN] Alerte reçue envoyée à : ${destinataire}`);
    console.log(`✉️ [USER] Confirmation de réception envoyée à : ${email}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

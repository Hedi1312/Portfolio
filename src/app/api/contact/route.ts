import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { render } from '@react-email/components';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

import { AdminNotification } from '@/emails/AdminNotification';
import { UserConfirmation } from '@/emails/UserConfirmation';
import { prisma } from '@/lib/prisma';

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
    const honeypot = formData.get('company') as string;

    if (honeypot) return NextResponse.json({ success: true });

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs requis.' }, { status: 400 });
    }

    // Gérer les pièces jointes (multiple)
    const files = formData.getAll('files') as File[];
    const emailAttachments = [];
    const dbAttachments: { filename: string; path: string }[] = [];

    if (files.length > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      for (const file of files) {
        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const ext = path.extname(file.name);
          const uniqueName = `${randomUUID()}${ext}`;
          const filePath = path.join(uploadsDir, uniqueName);

          await writeFile(filePath, buffer);

          emailAttachments.push({
            filename: file.name,
            content: buffer,
          });

          dbAttachments.push({
            filename: file.name,
            path: `/uploads/${uniqueName}`,
          });
        }
      }
    }

    // Sauvegarder en base de données
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
        attachments: dbAttachments,
      },
    });

    // Envoyer les emails
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
      attachments: emailAttachments,
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

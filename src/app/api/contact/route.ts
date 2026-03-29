import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { render } from '@react-email/components';

import { AdminNotification } from '@/emails/AdminNotification';
import { UserConfirmation } from '@/emails/UserConfirmation';
import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/lib/schemas/contact';

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
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const honeypot = formData.get('company') as string;

    if (honeypot) return NextResponse.json({ success: true });

    // Validation Zod
    const validation = contactSchema.safeParse({ name, email, subject, message });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    // Handle multiple attachments
    const files = formData.getAll('files') as File[];
    const emailAttachments = [];
    const dbAttachments: { filename: string; path: string; public_id?: string }[] = [];

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
            content: buffer, // Garder le buffer pour l'email nodemailer
          });

          dbAttachments.push({
            filename: file.name,
            path: uploaded.url,
            public_id: uploaded.public_id,
          });
        }
      }
    }

    // Upsert contact
    const contact = await prisma.contact.upsert({
      where: { email },
      update: { name, updatedAt: new Date() },
      create: { email, name },
    });

    // Save message
    await prisma.contactMessage.create({
      data: {
        email,
        subject,
        message,
        attachments: dbAttachments,
        contactId: contact.id,
      },
    });

    // Send emails to admin and user
    const destinataire = process.env.ADMIN_MAIL as string;
    let prefixe = '';

    if (process.env.VERCEL_ENV === 'preview') {
      prefixe = '[PREVIEW] ';
    } else if (!process.env.VERCEL_ENV) {
      prefixe = '[LOCAL] ';
    }

    const emailSubject = `${prefixe}[${subject}] Nouveau message de ${name}`;

    const adminHtml = await render(AdminNotification({ name, email, subject, message }));
    const userHtml = await render(UserConfirmation({ name }));

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: destinataire,
      replyTo: email,
      subject: emailSubject,
      attachments: emailAttachments,
      html: adminHtml,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `${prefixe}Merci pour ton message !`,
      html: userHtml,
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

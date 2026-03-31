import { NextResponse } from 'next/server';
import { render } from '@react-email/components';

import { AdminNotification } from '@/emails/AdminNotification';
import { UserConfirmation } from '@/emails/UserConfirmation';
import { prisma } from '@/lib/prisma';
import { contactSchema } from '@/lib/schemas/contact';
import { rateLimit } from '@/lib/rate-limit';
import { transporter, getEmailSubjectPrefix } from '@/lib/mailer';

// Rate limit: 5 contact submissions per minute per IP
const limiter = rateLimit({ limit: 5, window: '1 m', prefix: 'rl:contact' });

export async function POST(req: Request) {
  // IP Rate limiting
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const { success, retryAfter } = await limiter.check(ip);

  if (!success) {
    return NextResponse.json(
      { error: `Trop de tentatives. Réessayez dans ${retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

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

    // Handle multiple attachments - SECURITY FIX: Limit to 5 max
    const allFiles = formData.getAll('files') as File[];
    const files = allFiles.slice(0, 5);
    const emailAttachments = [];
    const dbAttachments: { filename: string; path: string; public_id?: string }[] = [];

    if (files.length > 0) {
      const { uploadToCloudinary } = await import('@/lib/cloudinary');

      for (const file of files) {
        if (file && file.size > 0) {
          // SECURITY FIX: Limit file type
          const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'application/pdf',
          ];
          if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
              { error: `Le type du fichier "${file.name}" n'est pas autorisé.` },
              { status: 400 },
            );
          }

          // SECURITY FIX: Limit file size
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
    const prefixe = getEmailSubjectPrefix();

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

'use server';

import { render } from '@react-email/components';
import { headers } from 'next/headers';

import { AdminNotification } from '@/emails/AdminNotification';
import { UserConfirmation } from '@/emails/UserConfirmation';
import { getEmailSubjectPrefix, sendEmail } from '@/lib/mailer';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { contactSchema } from '@/lib/schemas/contact';

// IP rate limit: 5 submissions/min
const limiter = rateLimit({ limit: 5, window: '1 m', prefix: 'rl:contact' });

export type ContactState = {
  success?: boolean;
  error?: string;
};

export async function submitContact(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // IP Rate limiting
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const { success: rateLimitSuccess, retryAfter } = await limiter.check(ip);

  if (!rateLimitSuccess) {
    return { error: `Too many attempts. Try again in ${retryAfter}s.` };
  }

  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const honeypot = formData.get('company') as string;

    if (honeypot) return { success: true }; // Silent bypass for bots

    const validation = contactSchema.safeParse({ name, email, subject, message });
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    // Attachment handling with 5-file security cap
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
            return { error: `Le type du fichier "${file.name}" n'est pas autorisé.` };
          }

          // SECURITY FIX: Limit file size
          if (file.size > 10 * 1024 * 1024) {
            return { error: `Le fichier "${file.name}" dépasse la limite de 10 Mo.` };
          }

          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Magic Bytes Validation (A05: Injection mitigation)
          const header = buffer.toString('hex', 0, 4).toUpperCase();
          const isJpeg = header.startsWith('FFD8FF');
          const isPng = header === '89504E47';
          const isGif = header.startsWith('47494638'); // GIF8
          const isPdf = header === '25504446'; // %PDF
          const isWebp =
            header === '52494646' && buffer.toString('hex', 8, 12).toUpperCase() === '57454250';

          if (!isJpeg && !isPng && !isGif && !isPdf && !isWebp) {
            return { error: `File content for "${file.name}" is corrupt or illegal.` };
          }

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

    const contact = await prisma.contact.upsert({
      where: { email },
      update: { name, updatedAt: new Date() },
      create: { email, name },
    });

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
    const destinataire = process.env.CONTACT_NOTIFICATION_EMAIL as string;
    const prefixe = getEmailSubjectPrefix();

    const emailSubject = `${prefixe}[${subject}] Nouveau message de ${name}`;

    const adminHtml = await render(AdminNotification({ name, email, subject, message }));
    const userHtml = await render(UserConfirmation({ name }));

    await sendEmail({
      from: process.env.SMTP_FROM as string,
      to: destinataire,
      replyTo: email,
      subject: emailSubject,
      attachments: emailAttachments,
      html: adminHtml,
    });

    await sendEmail({
      from: process.env.SMTP_FROM as string,
      to: email,
      subject: `${prefixe}Merci pour ton message !`,
      html: userHtml,
    });

    return { success: true };
  } catch (error) {
    console.error('[actions/contact]', error);
    return { error: 'Erreur serveur.' };
  }
}

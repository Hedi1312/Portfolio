import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// ─── Shared Email Interface ────────────────────────────────────────
export interface SendEmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
}

// ─── Transport Strategy Selection ──────────────────────────────────
const isResendConfigured = !!process.env.RESEND_API_KEY;

/**
 * Sends an email using Resend SDK (Prod/Staging) or SMTP/Mailpit (Local).
 * Automatically toggles transport based on RESEND_API_KEY presence.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (isResendConfigured) {
    await sendViaResend(options);
  } else {
    await sendViaSMTP(options);
  }
}

// ─── Resend SDK Transport (Production / Staging) ───────────────────
async function sendViaResend(options: SendEmailOptions): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
    attachments: options.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });

  if (error) {
    throw new Error(`[Resend SDK] ${error.name}: ${error.message}`);
  }
}

// ─── SMTP Transport (Local / Fallback) ─────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendViaSMTP(options: SendEmailOptions): Promise<void> {
  await transporter.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
    attachments: options.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });
}

// Temporary export for compatibility during migration
export { transporter };

/**
 * Returns the environment-specific subject prefix.
 * Prod: '' | Preview: '[PREVIEW] ' | Local: '[LOCAL] '
 */
export function getEmailSubjectPrefix(): string {
  if (process.env.VERCEL_ENV === 'preview') return '[PREVIEW] ';
  if (!process.env.VERCEL_ENV) return '[LOCAL] ';
  return '';
}

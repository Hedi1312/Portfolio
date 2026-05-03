import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// ─── Interface partagée pour l'envoi d'emails ──────────────────────
export interface SendEmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
}

// ─── Sélection de la stratégie de transport ────────────────────────
const isResendConfigured = !!process.env.RESEND_API_KEY;

/**
 * Envoie un email via le SDK Resend (Prod/Staging) ou SMTP/Mailpit (Local).
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (isResendConfigured) {
    await sendViaResend(options);
  } else {
    await sendViaSMTP(options);
  }
}

// ─── Transport via SDK Resend (Production / Staging) ───────────────
async function sendViaResend(options: SendEmailOptions): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: options.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo, // Resend SDK uses camelCase for replyTo
    attachments: options.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });

  if (error) {
    throw new Error(`[Resend SDK] ${error.name}: ${error.message}`);
  }

  console.log(`[Resend SDK] Email envoyé avec succès. ID: ${data?.id}`);
}

// ─── Transport via SMTP (Local / Fallback) ─────────────────────────
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
  console.log(`[SMTP] Email envoyé via ${process.env.SMTP_HOST}`);
}

// Export temporaire pour compatibilité pendant la migration
export { transporter };

/**
 * Retourne le préfixe du sujet selon l'environnement.
 */
export function getEmailSubjectPrefix(): string {
  if (process.env.VERCEL_ENV === 'preview') return '[PREVIEW] ';
  if (!process.env.VERCEL_ENV) return '[LOCAL] ';
  return '';
}

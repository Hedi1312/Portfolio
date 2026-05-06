import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { Resend } from 'resend';

// ─── Shared Email Interface ────────────────────────────────────────
export interface SendEmailOptions {
  /** Sender address. Falls back to EMAIL_FROM or SMTP_FROM env var if omitted. */
  from?: string;
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
}

// ─── Transport Strategy Selection ──────────────────────────────────
const isResendConfigured = !!process.env.RESEND_API_KEY;

/**
 * Resolves the sender address from env vars.
 * Checks EMAIL_FROM first, then SMTP_FROM for backward compatibility.
 */
function getDefaultFromAddress(): string {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM;
  if (!from) {
    throw new Error(
      '[Mailer] Missing sender address: set EMAIL_FROM or SMTP_FROM in environment variables.',
    );
  }
  return from;
}

/**
 * Sends an email using Resend SDK (Prod/Staging) or SMTP/Mailpit (Local).
 * Automatically toggles transport based on RESEND_API_KEY presence.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const resolvedOptions = {
    ...options,
    from: options.from || getDefaultFromAddress(),
  };

  if (isResendConfigured) {
    await sendViaResend(resolvedOptions);
  } else {
    await sendViaSMTP(resolvedOptions);
  }
}

// ─── Resend SDK Transport (Production / Staging) ───────────────────
async function sendViaResend(options: SendEmailOptions & { from: string }): Promise<void> {
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

// ─── SMTP Transport (Local / Fallback — Lazy Init) ─────────────────
let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

async function sendViaSMTP(options: SendEmailOptions & { from: string }): Promise<void> {
  await getTransporter().sendMail({
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
export { getTransporter as transporter };

/**
 * Returns the environment-specific subject prefix.
 * Prod: '' | Preview: '[PREVIEW] ' | Local: '[LOCAL] '
 */
export function getEmailSubjectPrefix(): string {
  if (process.env.VERCEL_ENV === 'preview') return '[PREVIEW] ';
  if (!process.env.VERCEL_ENV) return '[LOCAL] ';
  return '';
}

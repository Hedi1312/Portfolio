import nodemailer from 'nodemailer';

/**
 * Shared Nodemailer transporter singleton.
 * Reuses a single connection pool across all routes (contact, reply, password-reset).
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export { transporter };

/**
 * Returns the environment prefix for email subjects.
 * Production: '' | Preview: '[PREVIEW] ' | Local: '[LOCAL] '
 */
export function getEmailSubjectPrefix(): string {
  if (process.env.VERCEL_ENV === 'preview') return '[PREVIEW] ';
  if (!process.env.VERCEL_ENV) return '[LOCAL] ';
  return '';
}

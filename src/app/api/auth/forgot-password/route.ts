export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import nodemailer from 'nodemailer';
import { render } from '@react-email/components';

import { prisma } from '@/lib/prisma';
import { resetSchema } from '@/lib/schemas/auth';
import { PasswordReset } from '@/emails/PasswordReset';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const SUCCESS_MESSAGE =
  'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = resetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { email } = validation.data;
    const admin = await prisma.admin.findUnique({ where: { email } });

    // Always return success to avoid email enumeration
    if (!admin) {
      return NextResponse.json({ message: SUCCESS_MESSAGE });
    }

    // Generate a secure token with 1-hour expiry
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Upsert: replace any existing token for this admin
    await prisma.passwordReset.upsert({
      where: { adminId: admin.id },
      update: { token, expiresAt },
      create: { token, expiresAt, adminId: admin.id },
    });

    // Build the reset link
    const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Send the email
    let prefixe = '';
    if (process.env.VERCEL_ENV === 'preview') {
      prefixe = '[PREVIEW] ';
    } else if (!process.env.VERCEL_ENV) {
      prefixe = '[LOCAL] ';
    }

    const html = await render(PasswordReset({ resetLink }));

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: admin.email,
      subject: `${prefixe}Réinitialisation de ton mot de passe`,
      html,
    });

    return NextResponse.json({ message: SUCCESS_MESSAGE });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

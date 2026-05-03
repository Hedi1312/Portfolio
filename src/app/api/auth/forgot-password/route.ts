export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { render } from '@react-email/components';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import { PasswordReset } from '@/emails/PasswordReset';
import { getEmailSubjectPrefix, sendEmail } from '@/lib/mailer';
import { prisma } from '@/lib/prisma';
import { authRateLimit } from '@/lib/rate-limit';
import { resetSchema } from '@/lib/schemas/auth';

// Rate limit: 5 attempts per 15 minutes per IP
const limiter = authRateLimit({ limit: 5, window: '15 m', prefix: 'rl:forgot-pw' });

const SUCCESS_MESSAGE =
  'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.';

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
    const body = await req.json();
    const validation = resetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { email } = validation.data;
    const admin = await prisma.admin.findUnique({ where: { email } });

    // Prevent email enumeration by always returning success
    if (!admin) {
      return NextResponse.json({ message: SUCCESS_MESSAGE });
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.passwordReset.upsert({
      where: { adminId: admin.id },
      update: { token, expiresAt },
      create: { token, expiresAt, adminId: admin.id },
    });

    const baseUrl = process.env.AUTH_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    const prefixe = getEmailSubjectPrefix();
    const html = await render(PasswordReset({ resetLink }));

    await sendEmail({
      from: process.env.SMTP_FROM as string,
      to: admin.email,
      subject: `${prefixe}Password Reset Request`,
      html,
    });

    return NextResponse.json({ message: SUCCESS_MESSAGE });
  } catch (error) {
    console.error('[api/auth/forgot-password]', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

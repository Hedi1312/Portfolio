export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

import { prisma } from '@/lib/prisma';
import { authRateLimit } from '@/lib/rate-limit';
import { newPasswordSchema } from '@/lib/schemas/auth';
import { verifyOTP } from '@/lib/otp';
import { decrypt } from '@/lib/crypto';

// Rate limit: 5 attempts/min per IP
const limiter = authRateLimit({ limit: 5, window: '1 m', prefix: 'rl:reset-pw' });

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
    const { token, password, confirmPassword, otpCode } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token manquant.' }, { status: 400 });
    }

    // Validate password via Zod
    const validation = newPasswordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    // Find the reset record
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { admin: true },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 400 });
    }

    // Check expiration
    if (new Date() > resetRecord.expiresAt) {
      // Clean up expired token
      await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
      return NextResponse.json(
        { error: 'Ce lien a expiré. Veuillez refaire une demande.' },
        { status: 400 },
      );
    }

    // TOTP verification (only when 2FA is active)
    const admin = resetRecord.admin;
    if (admin.otpSecret) {
      if (!otpCode || typeof otpCode !== 'string') {
        return NextResponse.json({ error: 'Le code OTP est requis.' }, { status: 400 });
      }
      const result = verifyOTP({ token: otpCode, secret: decrypt(admin.otpSecret), window: 1 });
      if (!result.valid) {
        return NextResponse.json({ error: 'Code OTP invalide ou expiré.' }, { status: 400 });
      }
    }

    // Hash the new password and update the admin
    const passwordHash = await bcrypt.hash(validation.data.password, 12);

    await prisma.admin.update({
      where: { id: resetRecord.adminId },
      data: {
        passwordHash,
        passwordUpdatedAt: new Date(),
      },
    });

    // Delete the used token
    await prisma.passwordReset.delete({ where: { id: resetRecord.id } });

    return NextResponse.json({
      message: 'Mot de passe mis à jour avec succès.',
    });
  } catch (error) {
    console.error('[api/auth/reset-password]', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

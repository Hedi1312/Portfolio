import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { NextResponse } from 'next/server';
const { verifySync } = require('otplib');

// Rate limit : 5 tentatives par minute par IP (anti brute-force OTP)
const limiter = rateLimit({ interval: 60_000, limit: 5 });

export async function POST(req: Request) {
  // Rate limiting par IP
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const { success, retryAfter } = limiter.check(ip);

  if (!success) {
    return NextResponse.json(
      { error: `Trop de tentatives. Réessayez dans ${retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const code = body?.code;

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json({ error: 'Code 2FA requis (6 chiffres).' }, { status: 400 });
    }

    // Retrieve the current secret to verify the code
    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
      select: { otpSecret: true },
    });

    if (!admin?.otpSecret) {
      return NextResponse.json({ error: 'Le 2FA n\u2019est pas activé.' }, { status: 400 });
    }

    // Verify the provided code against the stored secret
    const result = verifySync({ token: code, secret: admin.otpSecret, window: 1 });
    if (!result.valid) {
      return NextResponse.json({ error: 'Code invalide ou expiré.' }, { status: 400 });
    }

    // Code is valid — disable 2FA
    await prisma.admin.update({
      where: { email: session.user.email },
      data: { otpSecret: null },
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur interne côté serveur' }, { status: 500 });
  }
}

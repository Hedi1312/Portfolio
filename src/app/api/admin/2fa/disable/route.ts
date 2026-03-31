import { prisma } from '@/lib/prisma';
import { authRateLimit } from '@/lib/rate-limit';
import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp';
import { decrypt } from '@/lib/crypto';

// Rate limit: 5 attempts/min per IP
const limiter = authRateLimit({ limit: 5, window: '1 m', prefix: 'rl:2fa-disable' });

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
    const { session, unauthorized } = await requireAdmin();
    if (unauthorized) return unauthorized;

    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await req.json();
    const code = body?.code;

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json({ error: 'Code 2FA requis (6 chiffres).' }, { status: 400 });
    }

    // Retrieve the current secret to verify the code
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: { otpSecret: true },
    });

    if (!admin?.otpSecret) {
      return NextResponse.json({ error: 'Le 2FA n\u2019est pas activé.' }, { status: 400 });
    }

    // Verify the provided code against the decrypted stored secret
    const result = verifyOTP({ token: code, secret: decrypt(admin.otpSecret), window: 1 });
    if (!result.valid) {
      return NextResponse.json({ error: 'Code invalide ou expiré.' }, { status: 400 });
    }

    // Code is valid — disable 2FA
    await prisma.admin.update({
      where: { email },
      data: { otpSecret: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/admin/2fa/disable]', error);
    return NextResponse.json({ error: 'Erreur interne côté serveur' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { authRateLimit } from '@/lib/rate-limit';
import { generateOTPSecret, generateOTPUri } from '@/lib/otp';
import { encrypt } from '@/lib/crypto';
import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

// Rate limit: 5 requests/min per IP
const limiter = authRateLimit({ limit: 5, window: '1 m', prefix: 'rl:2fa-gen' });

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

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const secret = generateOTPSecret();

    await prisma.admin.update({
      where: { id: admin.id },
      data: { pendingOtpSecret: encrypt(secret) },
    });

    const otpauthUrl = generateOTPUri({
      label: admin.email,
      issuer: 'Portfolio Admin',
      secret,
    });

    return NextResponse.json({ otpauthUrl });
  } catch (error) {
    console.error('[api/admin/2fa/generate]', error);
    return NextResponse.json({ error: 'An error occurred during generation' }, { status: 500 });
  }
}

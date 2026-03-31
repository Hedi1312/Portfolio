import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { generateOTPSecret, generateOTPUri } from '@/lib/otp';
import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';

// Rate limit: 5 requests/min per IP
const limiter = rateLimit({ limit: 5, window: '1 m', prefix: 'rl:2fa-gen' });

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

    const admin = await prisma.admin.findUnique({
      where: { email: session!.user!.email! },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Generate secret and store it server-side (never sent to client)
    const secret = generateOTPSecret();

    await prisma.admin.update({
      where: { id: admin.id },
      data: { pendingOtpSecret: secret },
    });

    // Create otpauth URL for the QR code (contains secret but is only used for scanning)
    const otpauthUrl = generateOTPUri({
      label: admin.email,
      issuer: 'Portfolio Admin',
      secret,
    });

    return NextResponse.json({ otpauthUrl });
  } catch (_error) {
    return NextResponse.json({ error: 'An error occurred during generation' }, { status: 500 });
  }
}

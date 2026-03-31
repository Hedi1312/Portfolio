import { prisma } from '@/lib/prisma';
import { authRateLimit } from '@/lib/rate-limit';
import { verifyOTP } from '@/lib/otp';
import { requireAdmin } from '@/lib/auth-guard';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Rate limit: 5 attempts/min per IP
const limiter = authRateLimit({ limit: 5, window: '1 m', prefix: 'rl:2fa-verify' });

// Input Validation Schema — only the code now, secret stays server-side
const verifySchema = z.object({
  code: z.string().length(6, 'Le code doit contenir 6 chiffres').regex(/^\d+$/, 'Format invalide'),
});

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

    // Validate input against schema
    const validation = verifySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { code } = validation.data;

    // Retrieve the pending secret from the database (never from client)
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: { pendingOtpSecret: true },
    });

    if (!admin?.pendingOtpSecret) {
      return NextResponse.json(
        { error: 'Aucune configuration 2FA en attente. Relancez la génération.' },
        { status: 400 },
      );
    }

    // Verify code with 1 step window tolerance
    const result = verifyOTP({ token: code, secret: admin.pendingOtpSecret, window: 1 });

    if (!result.valid) {
      return NextResponse.json(
        { error: 'Le code fourni est invalide ou a expiré.' },
        { status: 400 },
      );
    }

    // Promote pending secret to active and clear pending
    await prisma.admin.update({
      where: { email },
      data: {
        otpSecret: admin.pendingOtpSecret,
        pendingOtpSecret: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/admin/2fa/verify]', error);
    return NextResponse.json({ error: 'An error occurred during verification' }, { status: 500 });
  }
}

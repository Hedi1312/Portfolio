import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
const { verifySync } = require('otplib');
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Rate limit: 5 attempts/min per IP
const limiter = rateLimit({ interval: 60_000, limit: 5 });

// @api-security-best-practices: Input Validation Schema
const verifySchema = z.object({
  code: z.string().length(6, 'Le code doit contenir 6 chiffres').regex(/^\d+$/, 'Format invalide'),
  secret: z.string().min(16, 'Secret invalide'),
});

export async function POST(req: Request) {
  // IP Rate limiting
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
    // @api-security-best-practices: Authorization check
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const { code, secret } = validation.data;

    // Verify code with 1 step window tolerance
    const result = verifySync({ token: code, secret, window: 1 });

    if (!result.valid) {
      // @api-security-best-practices: Generic error message to prevent brute forcing context
      return NextResponse.json(
        { error: 'Le code fourni est invalide ou a expiré.' },
        { status: 400 },
      );
    }

    // Save secret to database
    await prisma.admin.update({
      where: { email: session.user.email },
      data: { otpSecret: secret },
    });

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: 'An error occurred during verification' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

// Rate limit: 10 requests/min per IP (prevents brute-force of reset tokens)
const limiter = rateLimit({ limit: 10, window: '1 m', prefix: 'rl:verify-token' });

export async function GET(req: Request) {
  try {
    // IP Rate limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const { success } = await limiter.check(ip);

    if (!success) {
      return NextResponse.json({ valid: false }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord || new Date() > resetRecord.expiresAt) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({ valid: true });
  } catch (_error) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

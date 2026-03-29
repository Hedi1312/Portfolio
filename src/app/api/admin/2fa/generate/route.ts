import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
const { generateSecret, generateURI } = require('otplib');
import { NextResponse } from 'next/server';

// Rate limit: 5 requests/min per IP
const limiter = rateLimit({ interval: 60_000, limit: 5 });

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
    // @api-security-best-practices: Strong Authentication check
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Generate secret
    const secret = generateSecret();

    // Create otpauth URL for the QR code
    const otpauthUrl = generateURI({
      label: admin.email,
      issuer: 'Portfolio Admin',
      secret,
    });

    return NextResponse.json({ secret, otpauthUrl });
  } catch (_error) {
    // @api-security-best-practices: Sanitize error messages
    return NextResponse.json({ error: 'An error occurred during generation' }, { status: 500 });
  }
}

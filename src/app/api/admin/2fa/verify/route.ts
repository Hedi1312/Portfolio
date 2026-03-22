import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
const { verifySync } = require('otplib');
import { NextResponse } from 'next/server';
import { z } from 'zod';

// @api-security-best-practices: Input Validation Schema
const verifySchema = z.object({
  code: z.string().length(6, 'Le code doit contenir 6 chiffres').regex(/^\d+$/, 'Format invalide'),
  secret: z.string().min(16, 'Secret invalide'),
});

export async function POST(req: Request) {
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
  } catch (error) {
    console.error('[2FA_VERIFY_ERROR]:', error);
    return NextResponse.json({ error: 'An error occurred during verification' }, { status: 500 });
  }
}

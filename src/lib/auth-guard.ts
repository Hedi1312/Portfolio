import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Defense-in-depth secondary auth gate
// Validates the session email exists in the Admin table (single source of truth: database)
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      session: null,
      unauthorized: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    } as const;
  }

  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!admin) {
    return {
      session: null,
      unauthorized: NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 }),
    } as const;
  }

  return { session, unauthorized: null } as const;
}

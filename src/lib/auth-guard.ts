import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Secondary auth gate for admin routes.
 * Provides defense-in-depth on top of middleware protection.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      session: null,
      unauthorized: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    } as const;
  }

  return { session, unauthorized: null } as const;
}

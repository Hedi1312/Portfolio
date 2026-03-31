import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Defense-in-depth auth guard for admin API routes.
 * The middleware already protects /api/admin/* paths, but this provides
 * a second layer of verification inside each route handler.
 *
 * @returns The authenticated session, or a 401 NextResponse.
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

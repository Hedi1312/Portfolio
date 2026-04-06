import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Defense-in-depth secondary auth gate
export async function requireAdmin() {
  const session = await auth();

  const adminEmail = process.env.ADMIN_MAIL;

  if (!session?.user?.email) {
    return {
      session: null,
      unauthorized: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    } as const;
  }

  if (adminEmail && session.user.email !== adminEmail) {
    return {
      session: null,
      unauthorized: NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 }),
    } as const;
  }

  return { session, unauthorized: null } as const;
}

import { requireAdmin } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import SecuritySettingsClient from './client';
import { redirect } from 'next/navigation';

export default async function SecuritySettingsPage() {
  const { session, unauthorized } = await requireAdmin();
  if (unauthorized || !session?.user?.email) {
    redirect('/admin-login?error=SessionExpired');
  }

  // @react-best-practices: Fetch data on the server and pass minimal props to client
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
    select: { otpSecret: true },
  });

  const is2FAEnabled = !!admin?.otpSecret;

  return <SecuritySettingsClient initialIs2FAEnabled={is2FAEnabled} />;
}

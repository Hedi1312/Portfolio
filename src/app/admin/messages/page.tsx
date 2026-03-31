import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { redirect } from 'next/navigation';
import MessagesClient from './MessagesClient';

export default async function MessagesPage() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) {
    redirect('/admin-login');
  }

  // Fetch all contacts with nested messages and replies
  const contacts = await prisma.contact.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          replies: { orderBy: { createdAt: 'asc' } },
        },
      },
    },
  });

  // Render client component
  // Serializing dates to strings to match frontend types and avoid hydration issues
  const serializedContacts = JSON.parse(JSON.stringify(contacts));

  return <MessagesClient initialContacts={serializedContacts} />;
}

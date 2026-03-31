import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';

// GET → All contacts with their messages and replies
export async function GET() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
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

    // Count unread messages
    const unreadCount = await prisma.contactMessage.count({
      where: { isRead: false },
    });

    return NextResponse.json({ contacts, unreadCount });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

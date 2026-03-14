import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET → Tous les messages triés par date (récents en premier) + compteur non lus
export async function GET() {
  try {
    const [messages, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactMessage.count({
        where: { isRead: false },
      }),
    ]);

    return NextResponse.json({ messages, unreadCount });
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET → Tous les contacts avec leurs messages et réponses
export async function GET() {
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

    // Compter les messages non lus
    const unreadCount = await prisma.contactMessage.count({
      where: { isRead: false },
    });

    return NextResponse.json({ contacts, unreadCount });
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

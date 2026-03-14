import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET → Compteur de messages non lus (pour le badge de la cloche)
export async function GET() {
  try {
    const count = await prisma.contactMessage.count({
      where: { isRead: false },
    });
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Erreur compteur non lus:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

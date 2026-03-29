import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET -> Unread messages counter
export async function GET() {
  try {
    const count = await prisma.contactMessage.count({
      where: { isRead: false },
    });
    return NextResponse.json({ count });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

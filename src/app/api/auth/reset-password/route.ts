export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

import { prisma } from '@/lib/prisma';
import { newPasswordSchema } from '@/lib/schemas/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password, confirmPassword } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token manquant.' }, { status: 400 });
    }

    // Validate password via Zod
    const validation = newPasswordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    // Find the reset record
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { admin: true },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 400 });
    }

    // Check expiration
    if (new Date() > resetRecord.expiresAt) {
      // Clean up expired token
      await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
      return NextResponse.json(
        { error: 'Ce lien a expiré. Veuillez refaire une demande.' },
        { status: 400 },
      );
    }

    // Hash the new password and update the admin
    const passwordHash = await bcrypt.hash(validation.data.password, 10);

    await prisma.admin.update({
      where: { id: resetRecord.adminId },
      data: {
        passwordHash,
        passwordUpdatedAt: new Date(),
      },
    });

    // Delete the used token
    await prisma.passwordReset.delete({ where: { id: resetRecord.id } });

    console.log(`✅ [RESET] Mot de passe mis à jour pour : ${resetRecord.admin.email}`);

    return NextResponse.json({
      message: 'Mot de passe mis à jour avec succès.',
    });
  } catch (error) {
    console.error('Erreur reset-password:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

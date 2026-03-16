import { NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: segments } = await params;
    const filename = segments.join('/');

    // Sécurité : empêcher traversal
    if (filename.includes('..') || filename.includes('~')) {
      return NextResponse.json({ error: 'Chemin invalide.' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'storage', 'messages', filename);

    // Vérifier que le fichier existe
    try {
      await stat(filePath);
    } catch {
      return NextResponse.json({ error: 'Fichier introuvable.' }, { status: 404 });
    }

    const buffer = await readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filename)}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Erreur lecture fichier:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

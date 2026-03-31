import { NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/auth-guard';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

// Base directory for message attachments
const BASE_DIR = path.resolve(process.cwd(), 'storage', 'messages');

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  // Only authenticated admin can access message attachments
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { path: segments } = await params;
    const filename = segments.join('/');

    // Defense-in-depth: reject traversal patterns before resolution
    if (filename.includes('..') || filename.includes('\0')) {
      return NextResponse.json({ error: 'Chemin invalide.' }, { status: 400 });
    }

    // Build resolved path and verify it stays within BASE_DIR
    const filePath = path.resolve(BASE_DIR, filename);

    if (!filePath.startsWith(BASE_DIR + path.sep) && filePath !== BASE_DIR) {
      return NextResponse.json({ error: 'Chemin invalide.' }, { status: 400 });
    }

    // Reject forbidden characters and patterns
    if (/[<>:"|?*\x00-\x1f]/.test(filename)) {
      return NextResponse.json({ error: 'Chemin invalide.' }, { status: 400 });
    }

    // Verify file exists
    try {
      const statResult = await stat(filePath);
      if (!statResult.isFile()) {
        return NextResponse.json({ error: 'Fichier introuvable.' }, { status: 404 });
      }
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
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      },
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

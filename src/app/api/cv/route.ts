import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxies Cloudinary PDF to same-origin to bypass CORS and CSP restrictions.
 */
export async function GET(request: NextRequest) {
  try {
    const cv = await prisma.cv.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!cv?.url) {
      return NextResponse.json({ error: 'Aucun CV disponible.' }, { status: 404 });
    }

    // Upstream fetch circumvents CORS
    const upstream = await fetch(cv.url);

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Impossible de récupérer le CV.' }, { status: 502 });
    }

    const pdfBuffer = await upstream.arrayBuffer();
    const isDownload = request.nextUrl.searchParams.get('download') === 'true';

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': isDownload
          ? 'attachment; filename="CV_OKBA_Hedi.pdf"'
          : 'inline; filename="CV_OKBA_Hedi.pdf"',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Content-Length': String(pdfBuffer.byteLength),
        // Override global DENY for same-origin iframes
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; frame-ancestors 'self'",
      },
    });
  } catch (error) {
    console.error('[api/cv] Error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

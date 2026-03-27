import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { rateLimit } from '@/lib/rate-limit';

// Rate limit : 10 requêtes par minute par IP
const limiter = rateLimit({ interval: 60_000, limit: 10 });

export async function POST(req: Request) {
  try {
    // Rate limiting par IP
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const { success, retryAfter } = limiter.check(ip);

    if (!success) {
      return NextResponse.json(
        { error: `Trop de requêtes. Réessayez dans ${retryAfter}s.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } },
      );
    }

    const body = await req.json();
    const { subfolder, public_id } = body;

    if (!subfolder) {
      return NextResponse.json({ error: 'Le paramètre "subfolder" est requis.' }, { status: 400 });
    }

    // Construire le chemin complet côté serveur (pas besoin de NEXT_PUBLIC_)
    const baseFolder = process.env.CLOUDINARY_FOLDER || 'development';
    const folder = `${baseFolder}/${subfolder}`;

    const timestamp = Math.round(Date.now() / 1000);

    // Paramètres à signer (doivent correspondre exactement à ceux envoyés à Cloudinary)
    const paramsToSign: Record<string, string | number> = {
      timestamp,
      folder,
    };

    if (public_id) {
      paramsToSign.public_id = public_id;
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      cloudinary.config().api_secret as string,
    );

    return NextResponse.json({
      timestamp,
      signature,
      cloudName: cloudinary.config().cloud_name,
      apiKey: cloudinary.config().api_key,
      folder,
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

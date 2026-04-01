import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { rateLimit } from '@/lib/rate-limit';
import { requireAdmin } from '@/lib/auth-guard';
import { cloudinarySignSchema } from '@/lib/schemas/admin';

// Rate limit: 10 requests/min per IP
const limiter = rateLimit({ limit: 10, window: '1 m', prefix: 'rl:cloudinary' });

export async function POST(req: Request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    // IP Rate limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const { success, retryAfter } = await limiter.check(ip);

    if (!success) {
      return NextResponse.json(
        { error: `Trop de requêtes. Réessayez dans ${retryAfter}s.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } },
      );
    }

    const body = await req.json();

    const validation = cloudinarySignSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { subfolder, public_id } = validation.data;

    // Build full path on server
    const baseFolder = process.env.CLOUDINARY_FOLDER || 'development';
    const folder = `${baseFolder}/${subfolder}`;

    const timestamp = Math.round(Date.now() / 1000);

    // Parameters to sign (must match exactly those sent to Cloudinary)
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
  } catch (error) {
    console.error('[api/admin/cloudinary/sign]', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

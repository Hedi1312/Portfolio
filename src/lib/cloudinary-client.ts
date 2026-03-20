/**
 * Client-side Direct Upload vers Cloudinary.
 * Le fichier est envoyé directement du navigateur vers Cloudinary,
 * sans transiter par le serveur Next.js.
 */

interface DirectUploadOptions {
  /** Sous-dossier dans Cloudinary (ex: 'projets', 'cv') */
  subfolder: string;
  /** Type de ressource Cloudinary (par défaut: 'auto') */
  resource_type?: string;
  /** Public ID à forcer (optionnel, utilisé pour le CV) */
  public_id?: string;
}

interface DirectUploadResult {
  url: string;
  public_id: string;
  resource_type: string;
}

export async function directUploadToCloudinary(
  file: File | Blob,
  options: DirectUploadOptions,
): Promise<DirectUploadResult> {
  const resource_type = options.resource_type || 'auto';

  // 1. Obtenir la signature du serveur (le serveur construit le dossier complet)
  const signPayload: Record<string, string> = { subfolder: options.subfolder };
  if (options.public_id) {
    signPayload.public_id = options.public_id;
  }

  const signRes = await fetch('/api/admin/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signPayload),
  });

  if (!signRes.ok) {
    const err = await signRes.json();
    throw new Error(err.error || 'Impossible d\'obtenir la signature.');
  }

  const { timestamp, signature, cloudName, apiKey, folder } = await signRes.json();

  // 2. Upload direct vers Cloudinary
  const formData = new FormData();
  formData.append('file', file);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('api_key', apiKey);
  formData.append('folder', folder);

  if (options.public_id) {
    formData.append('public_id', options.public_id);
  }

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resource_type}/upload`,
    { method: 'POST', body: formData },
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json();
    throw new Error(err.error?.message || 'Erreur lors de l\'upload vers Cloudinary.');
  }

  const result = await uploadRes.json();

  return {
    url: result.secure_url,
    public_id: result.public_id,
    resource_type: result.resource_type,
  };
}

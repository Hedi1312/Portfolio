import { v2 as cloudinary } from 'cloudinary';

// Configuration automatique depuis process.env.CLOUDINARY_URL
// Assure-toi que la variable CLOUDINARY_URL est bien présente dans le .env
cloudinary.config({
  secure: true,
});

export { cloudinary };

export async function uploadToCloudinary(
  buffer: Buffer,
  filename: string,
  subfolder?: string,
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const baseFolder = process.env.CLOUDINARY_FOLDER || 'development';
    const folder = subfolder ? `${baseFolder}/${subfolder}` : baseFolder;

    // Pour que Cloudinary gère bien le format (pdf, images, etc)
    const resource_type = filename.toLowerCase().endsWith('.pdf') ? 'image' : 'auto';

    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: resource_type,
          // On peut forcer un nom de fichier si besoin, mais cloudinary gère bien le random par défaut
          // Si tu veux garder le format "randomUUID.pdf", tu peux passer le nom ici.
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          if (!result) return reject(new Error('Cloudinary upload failed: No result'));

          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        },
      )
      .end(buffer);
  });
}

export async function deleteFromCloudinary(public_id: string): Promise<void> {
  try {
    // On laisse resource_type:'auto' ou on ne le passe pas ? Si c'était raw, il faut préciser.
    // Cloudinary recommande de ne pas spécifier si image/video, mais pour raw il le faut parfois.
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error('Erreur lors de la suppression sur Cloudinary:', error);
  }
}

import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

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
): Promise<{ url: string; public_id: string; resource_type: string }> {
  return new Promise((resolve, reject) => {
    const baseFolder = process.env.CLOUDINARY_FOLDER || 'development';
    const folder = subfolder ? `${baseFolder}/${subfolder}` : baseFolder;

    // On repasse en mode image pour que Cloudinary génère une vraie preview et conserve la nature PDF
    const isPdf = filename.toLowerCase().endsWith('.pdf');
    const resource_type = isPdf ? 'image' : 'auto';

    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: resource_type,
          // Optionnel : on peut forcer le nom pour bien avoir le .pdf affiché dans Cloudinary
          public_id: isPdf ? path.parse(filename).name : undefined,
          invalidate: true,
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
            resource_type: result.resource_type,
          });
        },
      )
      .end(buffer);
  });
}

export async function deleteFromCloudinary(
  public_id: string,
  resource_type: string = 'image',
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(public_id, { resource_type, invalidate: true });
  } catch (error) {
    console.error('Erreur lors de la suppression sur Cloudinary:', error);
  }
}

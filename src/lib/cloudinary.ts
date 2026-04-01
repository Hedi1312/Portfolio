import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

// Auto-configured via process.env.CLOUDINARY_URL
// Ensure CLOUDINARY_URL is present in .env
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

    // Use 'image' type for PDFs to enable Cloudinary's document preview features
    const isPdf = filename.toLowerCase().endsWith('.pdf');
    const resource_type = isPdf ? 'image' : 'auto';

    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: resource_type,
          public_id: isPdf ? path.parse(filename).name : undefined,
          invalidate: true,
        },
        (error, result) => {
          if (error) {
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
    console.error('[cloudinary:delete]', public_id, error);
  }
}

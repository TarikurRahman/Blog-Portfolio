import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResponse {
  id: string;
  url: string;
  displayUrl: string;
  deleteUrl: string;
}

export class CloudinaryHelper {
  static async uploadImage(base64Image: string, folder: string = 'general'): Promise<CloudinaryUploadResponse> {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Please configure Cloudinary credentials inside .env.local');
    }

    try {
      // Cloudinary SDK accepts base64 data URLs directly
      const uploadResult = await cloudinary.uploader.upload(base64Image, {
        folder: `portfolio/${folder}`,
        resource_type: 'image',
      });

      return {
        id: uploadResult.public_id,
        url: uploadResult.secure_url,
        displayUrl: uploadResult.secure_url,
        deleteUrl: '', // Cloudinary does not use a direct delete URL (it deletes via API using public_id)
      };
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      throw new Error(`Cloudinary upload failed: ${err.message || err}`);
    }
  }
}

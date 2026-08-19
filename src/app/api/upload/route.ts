import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import MediaAsset from '@/models/MediaAsset';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';
import { CloudinaryHelper } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload) {
      return ApiResponse.unauthorized('Authentication required to upload media.');
    }

    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return ApiResponse.error('No form data received', 400);
    }

    const files = formData.getAll('file') as File[];
    const folder = (formData.get('folder') as string) || 'general';

    if (!files || files.length === 0) {
      return ApiResponse.error('No file(s) found in request', 400);
    }

    const validFolders = ['blog', 'project', 'avatar', 'seo', 'general', 'site-media', 'course'];
    if (!validFolders.includes(folder)) {
      return ApiResponse.error(`Invalid folder type. Allowed: ${validFolders.join(', ')}`, 400);
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const MAX_SIZE = 5 * 1024 * 1024;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return ApiResponse.error(`Invalid file type: ${file.name}. Allowed: jpg, jpeg, png, webp`, 400);
      }
      if (file.size > MAX_SIZE) {
        return ApiResponse.error(`File size exceeds 5MB limit: ${file.name}`, 400);
      }
    }

    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const base64String = `data:${file.type};base64,${base64}`;

      const uploadResult = await CloudinaryHelper.uploadImage(base64String, folder);

      const media = await MediaAsset.create({
        uploadedBy: payload.userId,
        fileUrl: uploadResult.url,
        displayUrl: uploadResult.displayUrl,
        deleteUrl: uploadResult.deleteUrl,
        imgbbId: uploadResult.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        folder,
        altText: file.name.split('.')[0] || '',
        caption: '',
      });

      return {
        id: media._id.toString(),
        fileUrl: media.fileUrl,
        displayUrl: media.displayUrl,
        deleteUrl: media.deleteUrl,
        imgbbId: media.imgbbId,
        fileName: media.fileName,
        fileType: media.fileType,
        fileSize: media.fileSize,
        folder: media.folder,
      };
    });

    const results = await Promise.all(uploadPromises);
    const responseData = files.length === 1 ? results[0] : results;
    return ApiResponse.success(responseData, `${files.length} file(s) uploaded successfully`, 201);
  } catch (err: any) {
    console.error('File upload error:', err);
    return ApiResponse.serverError(err.message || 'File upload failed');
  }
}

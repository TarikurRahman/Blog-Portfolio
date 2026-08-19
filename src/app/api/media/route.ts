import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import MediaAsset from '@/models/MediaAsset';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload) {
      return ApiResponse.unauthorized('Authentication required.');
    }

    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder');
    const search = searchParams.get('search');

    const filter: any = {};
    if (folder) {
      filter.folder = folder;
    }
    if (search) {
      filter.fileName = { $regex: search, $options: 'i' };
    }

    const media = await MediaAsset.find(filter).populate('uploadedBy', 'name').sort({ createdAt: -1 }).lean();

    const formatted = media.map(m => ({
      id: m._id.toString(),
      uploadedBy: m.uploadedBy ? {
        id: (m.uploadedBy as any)._id.toString(),
        name: (m.uploadedBy as any).name,
      } : { id: '', name: 'System' },
      fileUrl: m.fileUrl,
      displayUrl: m.displayUrl,
      deleteUrl: m.deleteUrl,
      imgbbId: m.imgbbId,
      fileName: m.fileName,
      fileType: m.fileType,
      fileSize: m.fileSize,
      folder: m.folder,
      altText: m.altText || '',
      caption: m.caption || '',
      createdAt: m.createdAt.toISOString(),
    }));

    return ApiResponse.success(formatted, 'Media assets fetched successfully');
  } catch (err: any) {
    console.error('Fetch media error:', err);
    return ApiResponse.serverError('Failed to fetch media assets');
  }
}

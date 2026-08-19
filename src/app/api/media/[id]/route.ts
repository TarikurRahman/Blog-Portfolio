import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import MediaAsset from '@/models/MediaAsset';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = await params;
    const deleted = await MediaAsset.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound('Media asset not found');
    }

    return ApiResponse.success({}, 'Media asset deleted successfully');
  } catch (err: any) {
    console.error('Delete media error:', err);
    return ApiResponse.serverError('Failed to delete media asset');
  }
}

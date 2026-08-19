import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ReadRankChallenge from '@/models/ReadRankChallenge';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = params;
    if (!id) {
      return ApiResponse.error('Challenge ID is required', 400);
    }

    const body = await req.json().catch(() => ({}));
    const { resultPublished } = body;

    if (resultPublished === undefined) {
      return ApiResponse.error('resultPublished boolean is required', 400);
    }

    const challenge = await ReadRankChallenge.findByIdAndUpdate(
      id,
      { $set: { resultPublished: !!resultPublished } },
      { new: true }
    );

    if (!challenge) {
      return ApiResponse.notFound('Challenge not found');
    }

    return ApiResponse.success(
      challenge,
      `Challenge results ${resultPublished ? 'published' : 'unpublished'} successfully`
    );
  } catch (err: any) {
    console.error('Error publishing challenge result:', err);
    return ApiResponse.serverError(err.message || 'Failed to modify challenge publication status');
  }
}

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteReview from '@/models/SiteReview';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = params;
    const review = await SiteReview.findById(id);
    if (!review) {
      return ApiResponse.notFound('Review not found');
    }

    const body = await req.json().catch(() => ({}));
    const { status, isFeatured, adminReply } = body;

    if (status !== undefined) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return ApiResponse.error('Invalid status value', 400);
      }
      review.status = status;
    }
    if (isFeatured !== undefined) {
      review.isFeatured = !!isFeatured;
    }
    if (adminReply !== undefined) {
      review.adminReply = adminReply;
    }

    await review.save();

    return ApiResponse.success(review, 'Review updated successfully');
  } catch (err: any) {
    console.error('Error updating admin review:', err);
    return ApiResponse.serverError(err.message || 'Failed to update review');
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = params;
    const deleted = await SiteReview.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound('Review not found');
    }

    return ApiResponse.success({}, 'Review deleted successfully');
  } catch (err: any) {
    console.error('Error deleting admin review:', err);
    return ApiResponse.serverError(err.message || 'Failed to delete review');
  }
}

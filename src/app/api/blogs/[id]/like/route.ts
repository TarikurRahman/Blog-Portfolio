import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Like from '@/models/Like';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload) {
      return ApiResponse.unauthorized('Authentication required to like articles.');
    }

    const { id } = await params;
    const blog = await Blog.findById(id);
    if (!blog) {
      return ApiResponse.notFound('Article not found');
    }

    const existingLike = await Like.findOne({ blogId: id, userId: payload.userId });

    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });
      await Blog.findByIdAndUpdate(id, { $inc: { likesCount: -1 } });
      return ApiResponse.success({ liked: false }, 'Article unliked successfully');
    } else {
      // Like
      await Like.create({ blogId: id, userId: payload.userId });
      // The Like model save hook automatically increments Blog.likesCount
      return ApiResponse.success({ liked: true }, 'Article liked successfully');
    }
  } catch (err: any) {
    console.error('Like toggle error:', err);
    return ApiResponse.serverError('Failed to toggle like status');
  }
}

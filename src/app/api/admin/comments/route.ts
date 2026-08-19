import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Blog from '@/models/Blog';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload) {
      return ApiResponse.unauthorized('Authentication required.');
    }

    const query: any = {};
    if (payload.role !== 'admin') {
      query.userId = payload.userId;
    }

    const comments = await Comment.find(query)
      .populate('userId', 'name email avatarUrl')
      .populate('blogId', 'title')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = comments.map((c: any) => ({
      id: c._id.toString(),
      blogId: c.blogId ? c.blogId._id.toString() : '',
      blogTitle: c.blogId ? c.blogId.title : 'Deleted Article',
      userName: c.userId ? c.userId.name : 'Anonymous',
      userEmail: c.userId ? c.userId.email : '',
      userAvatar: c.userId ? c.userId.avatarUrl : '',
      content: c.comment,
      date: c.createdAt.toISOString().split('T')[0],
      approved: c.status === 'approved',
    }));

    return ApiResponse.success(formatted, 'Comments fetched successfully');
  } catch (err: any) {
    console.error('Fetch admin comments error:', err);
    return ApiResponse.serverError('Failed to fetch comments');
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const body = await req.json().catch(() => ({}));
    const { id, approved } = body;

    if (!id) {
      return ApiResponse.error('Comment ID is required', 400);
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return ApiResponse.notFound('Comment not found');
    }

    const oldStatus = comment.status;
    const newStatus = approved ? 'approved' : 'hidden';

    if (oldStatus !== newStatus) {
      comment.status = newStatus;
      await comment.save();

      if (newStatus === 'approved') {
        await Blog.findByIdAndUpdate(comment.blogId, { $inc: { commentsCount: 1 } });
      } else if (oldStatus === 'approved') {
        await Blog.findByIdAndUpdate(comment.blogId, { $inc: { commentsCount: -1 } });
      }
    }

    return ApiResponse.success(comment, 'Comment status modified successfully');
  } catch (err: any) {
    console.error('Update comment status error:', err);
    return ApiResponse.serverError('Failed to update comment status');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return ApiResponse.error('Comment ID is required', 400);
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return ApiResponse.notFound('Comment not found');
    }

    await Comment.findByIdAndDelete(id);

    if (comment.status === 'approved') {
      await Blog.findByIdAndUpdate(comment.blogId, { $inc: { commentsCount: -1 } });
    }

    return ApiResponse.success({}, 'Comment deleted successfully');
  } catch (err: any) {
    console.error('Delete comment error:', err);
    return ApiResponse.serverError('Failed to delete comment');
  }
}

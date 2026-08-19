import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import Comment from '@/models/Comment';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';
import { Validators } from '@/lib/validators';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const payload = await AuthHelper.getAuthPayload();
    const isAdmin = payload?.role === 'admin';

    const query: any = { blogId: id };
    if (!isAdmin) {
      query.status = 'approved';
    }

    const comments = await Comment.find(query)
      .populate('userId', 'name avatarUrl email')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = comments.map((c: any) => ({
      id: c._id.toString(),
      blogId: c.blogId.toString(),
      userName: c.userId ? c.userId.name : 'Anonymous',
      userEmail: c.userId ? c.userId.email : '',
      userAvatar: c.userId ? c.userId.avatarUrl : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      content: c.comment,
      date: c.createdAt.toISOString().split('T')[0],
      approved: c.status === 'approved',
    }));

    return ApiResponse.success(formatted, 'Comments fetched successfully');
  } catch (err: any) {
    console.error('Fetch comments error:', err);
    return ApiResponse.serverError('Failed to fetch comments');
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload) {
      return ApiResponse.unauthorized('Authentication required to submit comments.');
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { content } = body;

    const validationError = Validators.validateComment(content);
    if (validationError) {
      return ApiResponse.error(validationError, 400);
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return ApiResponse.notFound('Article not found');
    }

    const comment = await Comment.create({
      blogId: id,
      userId: payload.userId,
      comment: content,
      status: 'approved',
    });

    const populated = await comment.populate('userId', 'name avatarUrl email');

    const formatted = {
      id: populated._id.toString(),
      blogId: populated.blogId.toString(),
      userName: (populated.userId as any).name,
      userEmail: (populated.userId as any).email,
      userAvatar: (populated.userId as any).avatarUrl,
      content: populated.comment,
      date: populated.createdAt.toISOString().split('T')[0],
      approved: populated.status === 'approved',
    };

    return ApiResponse.success(formatted, 'Comment submitted successfully', 201);
  } catch (err: any) {
    console.error('Create comment error:', err);
    return ApiResponse.serverError('Failed to submit comment');
  }
}

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Blog from '@/models/Blog';
import Project from '@/models/Project';
import Comment from '@/models/Comment';
import ContactMessage from '@/models/ContactMessage';
import MediaAsset from '@/models/MediaAsset';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const [
      totalUsers,
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalProjects,
      totalComments,
      pendingComments,
      totalMessages,
      newMessages,
      totalMedia
    ] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Project.countDocuments(),
      Comment.countDocuments(),
      Comment.countDocuments({ status: 'pending' }),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ status: 'new' }),
      MediaAsset.countDocuments(),
    ]);

    const stats = {
      totalUsers,
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalProjects,
      totalComments,
      pendingComments,
      totalContactMessages: totalMessages,
      newContactMessages: newMessages,
      totalMediaUploads: totalMedia,
    };

    return ApiResponse.success(stats, 'Stats fetched successfully');
  } catch (err: any) {
    console.error('Fetch admin stats error:', err);
    return ApiResponse.serverError('Failed to fetch admin stats');
  }
}

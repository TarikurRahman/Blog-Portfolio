import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const { slug } = await params;
    
    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate('author', 'name avatarUrl role').lean();

    if (!blog) {
      return ApiResponse.notFound('Article not found');
    }

    const payload = await AuthHelper.getAuthPayload();
    if (blog.status !== 'published' && payload?.role !== 'admin') {
      return ApiResponse.forbidden('Access denied');
    }

    const formatted = {
      id: blog._id.toString(),
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      tags: blog.tags,
      author: blog.author ? {
        id: (blog.author as any)._id.toString(),
        name: (blog.author as any).name,
        avatar: (blog.author as any).avatarUrl,
        role: (blog.author as any).role === 'admin' ? 'Administrator' : 'User'
      } : { id: '', name: 'Author', avatar: '', role: 'User' },
      date: (blog.publishedAt || blog.createdAt).toISOString().split('T')[0],
      readTime: blog.readTime,
      likes: blog.likesCount,
      commentsCount: blog.commentsCount,
      views: blog.viewsCount || 0,
      image: blog.featuredImage?.url || '',
      status: blog.status === 'published' ? 'Published' : 'Draft',
      seoTitle: blog.seoTitle,
      seoDescription: blog.seoDescription,
      seoKeywords: blog.seoKeywords,
      seoOgImage: blog.ogImage,
      canonicalUrl: blog.canonicalUrl
    };

    return ApiResponse.success(formatted, 'Article fetched by slug successfully');
  } catch (err: any) {
    console.error('Fetch blog by slug error:', err);
    return ApiResponse.serverError('Failed to fetch article');
  }
}

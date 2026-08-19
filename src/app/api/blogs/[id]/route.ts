import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';
import { serverCache } from '@/lib/server-cache';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const blog = await Blog.findByIdAndUpdate(
      id,
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

    const isUserAuthenticated = !!payload;

    const formatted = {
      id: blog._id.toString(),
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: isUserAuthenticated ? blog.content : '',
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
      seoOgImage: blog.ogImage
    };

    // Invalidate list caches as viewsCount is incremented
    serverCache.clear();

    return ApiResponse.success(formatted, 'Article fetched successfully');
  } catch (err: any) {
    console.error('Fetch blog error:', err);
    return ApiResponse.serverError('Failed to fetch article');
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { title, excerpt, content, category, tags, readTime, featuredImage, galleryImages, status, seoTitle, seoDescription, seoKeywords, ogImage, canonicalUrl } = body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return ApiResponse.notFound('Article not found');
    }

    const updateFields: any = {};
    if (title) updateFields.title = title;
    if (excerpt) updateFields.excerpt = excerpt;
    if (content) {
      updateFields.content = content;
      const wordCount = content.split(/\s+/).length;
      updateFields.readTime = readTime || `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    } else if (readTime) {
      updateFields.readTime = readTime;
    }
    if (category) updateFields.category = category;
    if (tags) updateFields.tags = tags;
    if (featuredImage) {
      updateFields.featuredImage = typeof featuredImage === 'string' ? { url: featuredImage } : featuredImage;
    }
    if (galleryImages) updateFields.galleryImages = galleryImages;
    if (status) {
      const blogStatus = status === 'Published' || status === 'published' ? 'published' : 'draft';
      updateFields.status = blogStatus;
      if (blogStatus === 'published' && !blog.publishedAt) {
        updateFields.publishedAt = new Date();
      }
    }

    if (seoTitle !== undefined) updateFields.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateFields.seoDescription = seoDescription;
    if (seoKeywords !== undefined) updateFields.seoKeywords = seoKeywords;
    if (ogImage !== undefined) updateFields.ogImage = ogImage;
    if (canonicalUrl !== undefined) updateFields.canonicalUrl = canonicalUrl;

    const updated = await Blog.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    
    // Invalidate caches
    serverCache.clear();

    return ApiResponse.success(updated, 'Article updated successfully');
  } catch (err: any) {
    console.error('Update blog error:', err);
    return ApiResponse.serverError('Failed to update article');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = await params;
    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound('Article not found');
    }

    // Invalidate caches
    serverCache.clear();

    return ApiResponse.success({}, 'Article deleted successfully');
  } catch (err: any) {
    console.error('Delete blog error:', err);
    return ApiResponse.serverError('Failed to delete article');
  }
}

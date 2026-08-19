import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { ApiResponse } from '@/lib/api-response';

export async function GET() {
  try {
    await connectDB();
    let blogs = await Blog.find({ status: 'published', isFeatured: true })
      .populate('author', 'name avatarUrl role')
      .limit(3)
      .lean();

    if (blogs.length === 0) {
      blogs = await Blog.find({ status: 'published' })
        .populate('author', 'name avatarUrl role')
        .sort({ likesCount: -1 })
        .limit(3)
        .lean();
    }

    const formatted = blogs.map((b: any) => ({
      id: b._id.toString(),
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      category: b.category,
      tags: b.tags,
      author: b.author ? {
        id: b.author._id.toString(),
        name: b.author.name,
        avatar: b.author.avatarUrl,
        role: b.author.role === 'admin' ? 'Administrator' : 'User'
      } : { id: '', name: 'Author', avatar: '', role: 'User' },
      date: (b.publishedAt || b.createdAt).toISOString().split('T')[0],
      readTime: b.readTime,
      likes: b.likesCount,
      commentsCount: b.commentsCount,
      image: b.featuredImage?.url || '',
      status: b.status === 'published' ? 'Published' : 'Draft',
    }));

    return ApiResponse.success(formatted, 'Featured blogs fetched successfully');
  } catch (err: any) {
    console.error('Fetch featured blogs error:', err);
    return ApiResponse.serverError('Failed to fetch featured articles');
  }
}

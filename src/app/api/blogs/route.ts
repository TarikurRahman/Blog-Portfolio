import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';
import { generateUniqueSlug } from '@/lib/slugify';
import { serverCache } from '@/lib/server-cache';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const ids = searchParams.get('ids') || '';

    const payload = await AuthHelper.getAuthPayload();
    const isAdmin = payload?.role === 'admin';

    const cacheKey = `blogs:isAdmin=${isAdmin}:search=${search}:category=${category}:tag=${tag}:status=${status}:page=${page}:limit=${limit}:ids=${ids}`;
    const cachedData = serverCache.get<any>(cacheKey);
    if (cachedData) {
      return ApiResponse.success(cachedData, 'Blogs fetched successfully (from cache)');
    }

    await connectDB();

    const filter: any = {};

    if (ids) {
      filter._id = { $in: ids.split(',').filter(id => id.match(/^[0-9a-fA-F]{24}$/)) };
    }

    if (!isAdmin) {
      filter.status = 'published';
    } else if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (tag) {
      filter.tags = tag;
    }

    const skip = (page - 1) * limit;
    const total = await Blog.countDocuments(filter);
    
    let blogsQuery = Blog.find(filter)
      .populate('author', 'name avatarUrl role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const isUserAuthenticated = !!payload;
    if (!isUserAuthenticated) {
      // Select fields excluding content for unauthenticated users to optimize query size
      blogsQuery = blogsQuery.select('-content');
    }

    const blogs = await blogsQuery.lean();
 
    // Map model values for frontend compatibility
    const formatted = blogs.map((b: any) => ({
      id: b._id.toString(),
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: isUserAuthenticated ? (b.content || '') : '',
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
      views: b.viewsCount || 0,
      image: b.featuredImage?.url || '',
      status: b.status === 'published' ? 'Published' : 'Draft',
      seoTitle: b.seoTitle,
      seoDescription: b.seoDescription,
      seoKeywords: b.seoKeywords,
      seoOgImage: b.ogImage
    }));

    const responseData = {
      blogs: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };

    serverCache.set(cacheKey, responseData, 600000); // 10 minutes cache

    return ApiResponse.success(responseData);
  } catch (err: any) {
    console.error('Fetch blogs error:', err);
    return ApiResponse.serverError('Failed to fetch articles');
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const body = await req.json().catch(() => ({}));
    const { title, excerpt, content, category, tags, readTime, featuredImage, galleryImages, status, seoTitle, seoDescription, seoKeywords, ogImage, canonicalUrl } = body;

    if (!title || !excerpt || !content || !category) {
      return ApiResponse.error('Title, excerpt, content, and category are required fields.', 400);
    }

    const slug = await generateUniqueSlug(title, Blog);

    const wordCount = content.split(/\s+/).length;
    const computedReadTime = readTime || `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    // Map status strings
    const blogStatus = status === 'Published' || status === 'published' ? 'published' : 'draft';

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      category,
      tags: tags || [],
      author: payload.userId,
      featuredImage: typeof featuredImage === 'string' ? { url: featuredImage } : featuredImage,
      galleryImages: galleryImages || [],
      status: blogStatus,
      isFeatured: false,
      readTime: computedReadTime,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      seoKeywords: seoKeywords || '',
      ogImage: ogImage || '',
      canonicalUrl: canonicalUrl || '',
      publishedAt: blogStatus === 'published' ? new Date() : undefined
    });

    // Invalidate caches
    serverCache.clear();

    return ApiResponse.success(blog, 'Article created successfully', 201);
  } catch (err: any) {
    console.error('Create blog error:', err);
    return ApiResponse.serverError(err.message || 'Failed to create article');
  }
}

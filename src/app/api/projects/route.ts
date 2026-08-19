import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';
import { generateUniqueSlug } from '@/lib/slugify';
import { serverCache } from '@/lib/server-cache';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const cacheKey = `projects:search=${search}:category=${category}`;
    const cachedData = serverCache.get<any>(cacheKey);
    if (cachedData) {
      return ApiResponse.success(cachedData, 'Projects fetched successfully (from cache)');
    }

    await connectDB();

    const filter: any = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      filter.category = category;
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 }).lean();

    const formatted = projects.map(p => ({
      id: p._id.toString(),
      title: p.title,
      slug: p.slug,
      category: p.category,
      description: p.shortDescription,
      longDescription: p.fullDescription,
      tags: p.technologies,
      image: p.coverImage,
      status: p.status,
      liveUrl: p.liveUrl || '',
      githubUrl: p.githubUrl || '',
      features: p.features || [],
      challenge: p.challenge || '',
      solution: p.solution || '',
      seoTitle: p.seoTitle || '',
      seoDescription: p.seoDescription || '',
      seoKeywords: p.seoKeywords || '',
    }));

    serverCache.set(cacheKey, formatted, 600000); // 10 minutes cache

    return ApiResponse.success(formatted, 'Projects fetched successfully');
  } catch (err: any) {
    console.error('Fetch projects error:', err);
    return ApiResponse.serverError('Failed to fetch projects');
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
    const { title, category, shortDescription, description, longDescription, fullDescription, coverImage, image, technologies, tags, features, liveUrl, githubUrl, status, isFeatured, challenge, solution, seoTitle, seoDescription, seoKeywords } = body;

    const finalTitle = title;
    const finalCategory = category;
    const finalShortDesc = shortDescription || description;
    const finalFullDesc = fullDescription || longDescription;
    const finalCoverImg = coverImage || image;
    const finalTechs = technologies || (typeof tags === 'string' ? (tags as string).split(',').map((t: string) => t.trim()) : tags) || [];
    const finalFeatures = features || [];

    if (!finalTitle || !finalCategory || !finalShortDesc || !finalFullDesc || !finalCoverImg) {
      return ApiResponse.error('Title, category, short/long description, and cover image are required fields.', 400);
    }

    const slug = await generateUniqueSlug(finalTitle, Project);

    const project = await Project.create({
      title: finalTitle,
      slug,
      category: finalCategory,
      shortDescription: finalShortDesc,
      fullDescription: finalFullDesc,
      coverImage: finalCoverImg,
      technologies: finalTechs,
      features: finalFeatures,
      liveUrl: liveUrl || '',
      githubUrl: githubUrl || '',
      status: status || 'Completed',
      isFeatured: isFeatured || false,
      challenge: challenge || '',
      solution: solution || '',
      seoTitle: seoTitle || finalTitle,
      seoDescription: seoDescription || finalShortDesc,
      seoKeywords: seoKeywords || finalTechs.join(', '),
    });

    // Invalidate caches
    serverCache.clear();

    return ApiResponse.success(project, 'Project created successfully', 201);
  } catch (err: any) {
    console.error('Create project error:', err);
    return ApiResponse.serverError(err.message || 'Failed to create project');
  }
}

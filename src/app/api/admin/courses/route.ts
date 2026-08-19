import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';
import { generateUniqueSlug } from '@/lib/slugify';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const filter: any = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 }).lean();
    const formatted = courses.map((c: any) => ({
      id: c._id.toString(),
      title: c.title,
      slug: c.slug,
      shortDescription: c.shortDescription,
      description: c.description,
      thumbnailUrl: c.thumbnailUrl,
      bannerUrl: c.bannerUrl || '',
      price: c.price,
      salePrice: c.salePrice,
      category: c.category,
      level: c.level,
      totalDurationMinutes: c.totalDurationMinutes,
      totalLessons: c.totalLessons,
      isFeatured: c.isFeatured,
      showOnHome: c.showOnHome,
      badge: c.badge || 'none',
      whatYouWillLearn: c.whatYouWillLearn || [],
      requirements: c.requirements || [],
      faq: c.faq || [],
      status: c.status,
      seoTitle: c.seoTitle || '',
      seoDescription: c.seoDescription || '',
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    }));

    return ApiResponse.success(formatted, 'Courses fetched successfully');
  } catch (err: any) {
    console.error('Fetch admin courses error:', err);
    return ApiResponse.serverError('Failed to fetch courses');
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
    const {
      title,
      shortDescription,
      description,
      thumbnailUrl,
      bannerUrl,
      price,
      salePrice,
      category,
      level,
      totalDurationMinutes,
      totalLessons,
      isFeatured,
      showOnHome,
      badge,
      whatYouWillLearn,
      requirements,
      faq,
      status,
      seoTitle,
      seoDescription
    } = body;

    if (!title || !shortDescription || !description || !thumbnailUrl || !category) {
      return ApiResponse.error('Title, short description, full description, thumbnail, and category are required.', 400);
    }

    const slug = await generateUniqueSlug(title, Course);

    const newCourse = await Course.create({
      title,
      slug,
      shortDescription,
      description,
      thumbnailUrl,
      bannerUrl: bannerUrl || '',
      price: Number(price) || 0,
      salePrice: salePrice !== undefined && salePrice !== '' ? Number(salePrice) : undefined,
      category,
      level: level || 'beginner',
      totalDurationMinutes: Number(totalDurationMinutes) || 0,
      totalLessons: Number(totalLessons) || 0,
      isFeatured: isFeatured || false,
      showOnHome: showOnHome || false,
      badge: badge || 'none',
      whatYouWillLearn: whatYouWillLearn || [],
      requirements: requirements || [],
      faq: faq || [],
      status: status || 'draft',
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || shortDescription
    });

    return ApiResponse.success(newCourse, 'Course created successfully', 201);
  } catch (err: any) {
    console.error('Create course error:', err);
    return ApiResponse.serverError(err.message || 'Failed to create course');
  }
}

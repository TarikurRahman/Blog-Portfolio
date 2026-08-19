import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';
import { generateUniqueSlug } from '@/lib/slugify';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;

    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const course = await Course.findById(id).lean();
    if (!course) {
      return ApiResponse.notFound('Course not found');
    }

    const formatted = {
      id: course._id.toString(),
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      bannerUrl: course.bannerUrl || '',
      price: course.price,
      salePrice: course.salePrice,
      category: course.category,
      level: course.level,
      totalDurationMinutes: course.totalDurationMinutes,
      totalLessons: course.totalLessons,
      isFeatured: course.isFeatured,
      showOnHome: course.showOnHome,
      badge: course.badge || 'none',
      whatYouWillLearn: course.whatYouWillLearn || [],
      requirements: course.requirements || [],
      faq: course.faq || [],
      status: course.status,
      seoTitle: course.seoTitle || '',
      seoDescription: course.seoDescription || '',
    };

    return ApiResponse.success(formatted, 'Course fetched successfully');
  } catch (err: any) {
    console.error('Fetch course error:', err);
    return ApiResponse.serverError('Failed to fetch course');
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;

    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const course = await Course.findById(id);
    if (!course) {
      return ApiResponse.notFound('Course not found');
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

    if (title && title !== course.title) {
      course.slug = await generateUniqueSlug(title, Course, id);
      course.title = title;
    }

    if (shortDescription !== undefined) course.shortDescription = shortDescription;
    if (description !== undefined) course.description = description;
    if (thumbnailUrl !== undefined) course.thumbnailUrl = thumbnailUrl;
    if (bannerUrl !== undefined) course.bannerUrl = bannerUrl;
    if (price !== undefined) course.price = Number(price) || 0;
    if (salePrice !== undefined) {
      course.salePrice = salePrice !== '' && salePrice !== null ? Number(salePrice) : undefined;
    }
    if (category !== undefined) course.category = category;
    if (level !== undefined) course.level = level;
    if (totalDurationMinutes !== undefined) course.totalDurationMinutes = Number(totalDurationMinutes) || 0;
    if (totalLessons !== undefined) course.totalLessons = Number(totalLessons) || 0;
    if (isFeatured !== undefined) course.isFeatured = isFeatured;
    if (showOnHome !== undefined) course.showOnHome = showOnHome;
    if (badge !== undefined) course.badge = badge;
    if (whatYouWillLearn !== undefined) course.whatYouWillLearn = whatYouWillLearn;
    if (requirements !== undefined) course.requirements = requirements;
    if (faq !== undefined) course.faq = faq;
    if (status !== undefined) course.status = status;
    if (seoTitle !== undefined) course.seoTitle = seoTitle;
    if (seoDescription !== undefined) course.seoDescription = seoDescription;

    await course.save();

    return ApiResponse.success(course, 'Course updated successfully');
  } catch (err: any) {
    console.error('Update course error:', err);
    return ApiResponse.serverError(err.message || 'Failed to update course');
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;

    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return ApiResponse.notFound('Course not found');
    }

    return ApiResponse.success(null, 'Course deleted successfully');
  } catch (err: any) {
    console.error('Delete course error:', err);
    return ApiResponse.serverError('Failed to delete course');
  }
}

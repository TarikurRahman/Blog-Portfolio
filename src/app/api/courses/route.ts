import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') || '';
    const type = searchParams.get('type') || ''; // 'free' or 'paid'
    const isFeatured = searchParams.get('isFeatured') === 'true';
    const limitParam = searchParams.get('limit') ? parseInt(searchParams.get('limit') || '0', 10) : 0;
    const showOnHome = searchParams.get('showOnHome') === 'true';

    const filter: any = { status: 'published' };

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (level && level !== 'All') {
      filter.level = level;
    }
    if (type) {
      if (type === 'free') {
        filter.price = 0;
      } else if (type === 'paid') {
        filter.price = { $gt: 0 };
      }
    }
    if (isFeatured) {
      filter.isFeatured = true;
    }
    if (showOnHome) {
      filter.showOnHome = true;
    }

    let query = Course.find(filter).sort({ createdAt: -1 });
    if (limitParam > 0) {
      query = query.limit(limitParam);
    }

    const courses = await query.lean();

    const formatted = courses.map((c: any) => ({
      id: c._id.toString(),
      title: c.title,
      slug: c.slug,
      shortDescription: c.shortDescription,
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
    }));

    return ApiResponse.success(formatted, 'Courses fetched successfully');
  } catch (err: any) {
    console.error('Fetch courses error:', err);
    return ApiResponse.serverError('Failed to fetch courses');
  }
}

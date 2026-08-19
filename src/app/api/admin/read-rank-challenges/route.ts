import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ReadRankChallenge from '@/models/ReadRankChallenge';
import Blog from '@/models/Blog';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const totalChallenges = await ReadRankChallenge.countDocuments(query);
    const challenges = await ReadRankChallenge.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('blogId', 'title slug')
      .lean();

    const formatted = challenges.map((c: any) => ({
      id: c._id.toString(),
      blogId: c.blogId?._id?.toString() || null,
      blogTitle: c.blogId?.title || null,
      blogSlug: c.blogId?.slug || null,
      title: c.title,
      description: c.description,
      questionIds: c.questionIds.map((q: any) => q.toString()),
      questionSourceType: c.questionSourceType,
      category: c.category || '',
      totalQuestions: c.totalQuestions,
      timeLimitMinutes: c.timeLimitMinutes,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate.toISOString(),
      durationDays: c.durationDays,
      isActive: c.isActive,
      allowRetake: c.allowRetake,
      requireVerifiedUser: c.requireVerifiedUser,
      resultPublished: c.resultPublished,
      showOnHome: c.showOnHome,
      createdAt: c.createdAt.toISOString(),
    }));

    return ApiResponse.success(
      {
        challenges: formatted,
        pagination: {
          total: totalChallenges,
          page,
          limit,
          pages: Math.ceil(totalChallenges / limit),
        },
      },
      'Challenges fetched successfully'
    );
  } catch (err: any) {
    console.error('Error fetching admin challenges:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch challenges');
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
      blogId,
      title,
      description,
      questionIds,
      questionSourceType,
      category,
      totalQuestions,
      timeLimitMinutes,
      startDate,
      endDate,
      durationDays,
      isActive,
      allowRetake,
      requireVerifiedUser,
      resultPublished,
      showOnHome,
    } = body;

    if (!title || !description || !questionIds || questionIds.length === 0 || !questionSourceType || !totalQuestions || !startDate || !endDate) {
      return ApiResponse.error('Missing required fields or empty question IDs list', 400);
    }

    const newChallenge = await ReadRankChallenge.create({
      blogId: blogId || null,
      title,
      description,
      questionIds,
      questionSourceType,
      category: category || '',
      totalQuestions: Number(totalQuestions),
      timeLimitMinutes: Number(timeLimitMinutes) || 10,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      durationDays: Number(durationDays) || 7,
      isActive: isActive !== undefined ? isActive : true,
      allowRetake: allowRetake !== undefined ? allowRetake : false,
      requireVerifiedUser: requireVerifiedUser !== undefined ? requireVerifiedUser : true,
      resultPublished: resultPublished !== undefined ? resultPublished : false,
      showOnHome: showOnHome !== undefined ? showOnHome : true,
    });

    return ApiResponse.success(newChallenge, 'Challenge created successfully', 201);
  } catch (err: any) {
    console.error('Error creating admin challenge:', err);
    return ApiResponse.serverError(err.message || 'Failed to create challenge');
  }
}

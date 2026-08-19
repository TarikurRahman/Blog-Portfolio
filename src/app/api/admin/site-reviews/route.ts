import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteReview from '@/models/SiteReview';
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
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { reviewText: { $regex: search, $options: 'i' } },
      ];
    }

    // Aggregate statistics
    const statsResult = await SiteReview.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          featured: { $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] } },
          sumRating: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, '$overallRating', 0],
            },
          },
        },
      },
    ]);

    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      featured: 0,
      averageRating: 0,
    };

    if (statsResult.length > 0) {
      const r = statsResult[0];
      stats.total = r.total || 0;
      stats.pending = r.pending || 0;
      stats.approved = r.approved || 0;
      stats.featured = r.featured || 0;
      stats.averageRating = r.approved > 0 ? Number((r.sumRating / r.approved).toFixed(2)) : 0;
    }

    const totalReviews = await SiteReview.countDocuments(query);
    const reviews = await SiteReview.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formatted = reviews.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      email: r.email,
      userId: r.userId?.toString() || null,
      avatarUrl: r.avatarUrl,
      overallRating: r.overallRating,
      designRating: r.designRating,
      speedRating: r.speedRating,
      contentRating: r.contentRating,
      easeOfUseRating: r.easeOfUseRating,
      impressedBy: r.impressedBy,
      improvementSuggestions: r.improvementSuggestions,
      reviewText: r.reviewText,
      wouldRecommend: r.wouldRecommend,
      status: r.status,
      isFeatured: r.isFeatured,
      adminReply: r.adminReply || '',
      createdAt: r.createdAt.toISOString(),
    }));

    return ApiResponse.success(
      {
        reviews: formatted,
        pagination: {
          total: totalReviews,
          page,
          limit,
          pages: Math.ceil(totalReviews / limit),
        },
        stats,
      },
      'Site reviews fetched successfully'
    );
  } catch (err: any) {
    console.error('Error fetching admin reviews:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch reviews');
  }
}

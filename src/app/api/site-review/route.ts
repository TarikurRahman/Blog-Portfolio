import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteReview from '@/models/SiteReview';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const featuredOnly = searchParams.get('featured') === 'true';

    const query: any = { status: 'approved' };
    if (featuredOnly) {
      query.isFeatured = true;
    }

    const reviews = await SiteReview.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const formatted = reviews.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      avatarUrl: r.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      overallRating: r.overallRating,
      designRating: r.designRating,
      speedRating: r.speedRating,
      contentRating: r.contentRating,
      easeOfUseRating: r.easeOfUseRating,
      impressedBy: r.impressedBy || [],
      improvementSuggestions: r.improvementSuggestions || [],
      reviewText: r.reviewText,
      wouldRecommend: r.wouldRecommend,
      isFeatured: r.isFeatured,
      adminReply: r.adminReply || '',
      createdAt: r.createdAt.toISOString(),
    }));

    return ApiResponse.success(formatted, 'Site reviews fetched successfully');
  } catch (err: any) {
    console.error('Error fetching public site reviews:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch reviews');
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const {
      overallRating,
      designRating,
      speedRating,
      contentRating,
      easeOfUseRating,
      impressedBy,
      improvementSuggestions,
      reviewText,
      wouldRecommend,
    } = body;

    if (
      !overallRating ||
      !designRating ||
      !speedRating ||
      !contentRating ||
      !easeOfUseRating ||
      !reviewText ||
      wouldRecommend === undefined
    ) {
      return ApiResponse.error('Missing required rating details or review text', 400);
    }

    const payload = await AuthHelper.getAuthPayload();
    let name = body.name;
    let email = body.email;
    let userId = null;
    let avatarUrl = '';

    if (payload) {
      name = payload.email.split('@')[0];
      email = payload.email;
      userId = payload.userId;

      // Find user name and avatar
      const User = (await import('@/models/User')).default;
      const userObj = await User.findById(payload.userId).lean();
      if (userObj) {
        name = userObj.name;
        avatarUrl = userObj.avatarUrl || '';
      }
    } else {
      if (!name || !email) {
        return ApiResponse.error('Name and email are required for guests', 400);
      }
    }

    // Anti-spam check: check if a review was submitted by this email in the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await SiteReview.findOne({
      email: email.toLowerCase(),
      createdAt: { $gte: yesterday },
    }).lean();

    if (duplicate) {
      return ApiResponse.error('You can only submit one site review every 24 hours to prevent spam.', 429);
    }

    const newReview = await SiteReview.create({
      name,
      email: email.toLowerCase(),
      userId,
      avatarUrl: avatarUrl || undefined,
      overallRating: Number(overallRating),
      designRating: Number(designRating),
      speedRating: Number(speedRating),
      contentRating: Number(contentRating),
      easeOfUseRating: Number(easeOfUseRating),
      impressedBy: impressedBy || [],
      improvementSuggestions: improvementSuggestions || [],
      reviewText,
      wouldRecommend: !!wouldRecommend,
      status: 'pending',
      isFeatured: false,
    });

    return ApiResponse.success(newReview, 'Review submitted successfully and is pending approval', 201);
  } catch (err: any) {
    console.error('Error submitting site review:', err);
    return ApiResponse.serverError(err.message || 'Failed to submit review');
  }
}

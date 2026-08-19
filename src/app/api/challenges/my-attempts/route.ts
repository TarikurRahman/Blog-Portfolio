import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChallengeAttempt from '@/models/ChallengeAttempt';
import ReadRankChallenge from '@/models/ReadRankChallenge';
import Blog from '@/models/Blog';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload) {
      return ApiResponse.unauthorized('Not authenticated');
    }

    // Find attempts by this user
    const attempts = await ChallengeAttempt.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'challengeId',
        select: 'title resultPublished blogId',
        populate: {
          path: 'blogId',
          select: 'title slug',
        },
      })
      .lean();

    const formatted = attempts.map((a: any) => {
      const chal = a.challengeId || {};
      const blog = chal.blogId || {};
      
      return {
        id: a._id.toString(),
        challengeId: chal._id?.toString() || null,
        challengeTitle: chal.title || 'General Challenge',
        blogTitle: blog.title || 'General Category',
        blogSlug: blog.slug || null,
        score: a.score || 0,
        percentage: a.percentage || 0,
        timeTakenSeconds: a.timeTakenSeconds || 0,
        status: a.status,
        resultPublished: !!chal.resultPublished,
        createdAt: a.createdAt.toISOString(),
      };
    });

    return ApiResponse.success(formatted, 'My challenge attempts fetched successfully');
  } catch (err: any) {
    console.error('Error fetching user challenge attempts:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch attempts');
  }
}
export const dynamic = 'force-dynamic';

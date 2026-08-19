import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import ReadRankChallenge from '@/models/ReadRankChallenge';
import ChallengeAttempt from '@/models/ChallengeAttempt';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const { slug } = params;
    if (!slug) {
      return ApiResponse.error('Blog slug is required', 400);
    }

    const blog = await Blog.findOne({ slug }).lean();
    if (!blog) {
      return ApiResponse.notFound('Blog not found');
    }

    const now = new Date();
    // Find active challenge for this blog
    const challenge = await ReadRankChallenge.findOne({
      blogId: blog._id,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean();

    if (!challenge) {
      return ApiResponse.success({ hasChallenge: false }, 'No active challenge found for this blog');
    }

    // Check attempt status if logged in
    let hasAttempted = false;
    let attemptStatus = null;
    let attemptId = null;

    const payload = await AuthHelper.getAuthPayload();
    if (payload) {
      const attempt = await ChallengeAttempt.findOne({
        challengeId: challenge._id,
        userId: payload.userId,
      })
        .sort({ createdAt: -1 })
        .lean();

      if (attempt) {
        hasAttempted = true;
        attemptStatus = attempt.status;
        attemptId = attempt._id.toString();
      }
    }

    return ApiResponse.success(
      {
        hasChallenge: true,
        challenge: {
          id: challenge._id.toString(),
          title: challenge.title,
          description: challenge.description,
          totalQuestions: challenge.totalQuestions,
          timeLimitMinutes: challenge.timeLimitMinutes,
          allowRetake: challenge.allowRetake,
          requireVerifiedUser: challenge.requireVerifiedUser,
          resultPublished: challenge.resultPublished,
        },
        hasAttempted,
        attemptStatus,
        attemptId,
      },
      'Active challenge fetched successfully'
    );
  } catch (err: any) {
    console.error('Error fetching blog challenge:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch blog challenge');
  }
}

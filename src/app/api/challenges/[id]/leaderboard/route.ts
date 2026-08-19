import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ReadRankChallenge from '@/models/ReadRankChallenge';
import ChallengeAttempt from '@/models/ChallengeAttempt';
import User from '@/models/User';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const { id } = params;
    if (!id) {
      return ApiResponse.error('Challenge ID is required', 400);
    }

    const challenge = await ReadRankChallenge.findById(id).lean();
    if (!challenge) {
      return ApiResponse.notFound('Challenge not found');
    }

    const payload = await AuthHelper.getAuthPayload();
    const isAdmin = payload?.role === 'admin';

    if (!challenge.resultPublished && !isAdmin) {
      return ApiResponse.forbidden('The leaderboard for this challenge has not been published yet.');
    }

    // Fetch attempts
    const attempts = await ChallengeAttempt.find({
      challengeId: challenge._id,
      status: { $in: ['submitted', 'auto-submitted'] },
    })
      .sort({ score: -1, timeTakenSeconds: 1, submittedAt: 1 })
      .populate('userId', 'name avatarUrl')
      .lean();

    const formattedLeaderboard = attempts.map((a: any, idx) => ({
      rank: idx + 1,
      id: a._id.toString(),
      score: a.score,
      percentage: a.percentage,
      timeTakenSeconds: a.timeTakenSeconds,
      submittedAt: a.submittedAt.toISOString(),
      user: {
        name: a.userId?.name || 'Anonymous User',
        avatar: a.userId?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      },
    }));

    return ApiResponse.success(
      {
        leaderboard: formattedLeaderboard,
        challenge: {
          title: challenge.title,
          resultPublished: challenge.resultPublished,
        },
      },
      'Leaderboard fetched successfully'
    );
  } catch (err: any) {
    console.error('Error fetching challenge leaderboard:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch leaderboard');
  }
}

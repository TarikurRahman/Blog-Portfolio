import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ReadRankChallenge from '@/models/ReadRankChallenge';
import ChallengeAttempt from '@/models/ChallengeAttempt';
import User from '@/models/User';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get the latest published challenge
    const latestChallenge = await ReadRankChallenge.findOne({
      isActive: true,
      resultPublished: true,
    })
      .sort({ updatedAt: -1 })
      .lean();

    if (!latestChallenge) {
      return ApiResponse.success({ winners: [], challengeTitle: '' }, 'No published challenges found');
    }

    // Get top 3 attempts
    const attempts = await ChallengeAttempt.find({
      challengeId: latestChallenge._id,
      status: { $in: ['submitted', 'auto-submitted'] },
    })
      .sort({ score: -1, timeTakenSeconds: 1, submittedAt: 1 })
      .limit(3)
      .populate('userId', 'name avatarUrl')
      .lean();

    const winners = attempts.map((a: any, idx) => ({
      rank: idx + 1,
      id: a._id.toString(),
      score: a.score,
      timeTakenSeconds: a.timeTakenSeconds,
      user: {
        name: a.userId?.name || 'Anonymous User',
        avatar: a.userId?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      },
    }));

    return ApiResponse.success(
      {
        winners,
        challengeTitle: latestChallenge.title,
        challengeId: latestChallenge._id.toString(),
      },
      'Challenge winners fetched successfully'
    );
  } catch (err: any) {
    console.error('Error fetching challenge winners for home:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch challenge winners');
  }
}

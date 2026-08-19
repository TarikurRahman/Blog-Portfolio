import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChallengeAttempt from '@/models/ChallengeAttempt';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = params;
    if (!id) {
      return ApiResponse.error('Challenge ID is required', 400);
    }

    const attempts = await ChallengeAttempt.find({ challengeId: id })
      .sort({ score: -1, timeTakenSeconds: 1, submittedAt: 1 })
      .populate('userId', 'name email avatarUrl')
      .lean();

    const formatted = attempts.map((a: any) => ({
      id: a._id.toString(),
      userId: a.userId?._id?.toString() || null,
      userName: a.userId?.name || 'Unknown User',
      userEmail: a.userId?.email || 'Unknown Email',
      userAvatar: a.userId?.avatarUrl || '',
      startedAt: a.startedAt.toISOString(),
      submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
      timeTakenSeconds: a.timeTakenSeconds || 0,
      totalQuestions: a.totalQuestions,
      correctAnswers: a.correctAnswers || 0,
      wrongAnswers: a.wrongAnswers || 0,
      score: a.score || 0,
      percentage: a.percentage || 0,
      status: a.status,
    }));

    return ApiResponse.success(formatted, 'Challenge attempts fetched successfully');
  } catch (err: any) {
    console.error('Error fetching admin challenge attempts:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch challenge attempts');
  }
}

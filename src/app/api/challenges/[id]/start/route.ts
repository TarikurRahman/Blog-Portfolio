import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import ReadRankChallenge from '@/models/ReadRankChallenge';
import QuestionBank from '@/models/QuestionBank';
import ChallengeAttempt from '@/models/ChallengeAttempt';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const { id } = params;
    if (!id) {
      return ApiResponse.error('Challenge ID is required', 400);
    }

    const payload = await AuthHelper.getAuthPayload();
    if (!payload) {
      return ApiResponse.unauthorized('Please login or create an account to join this challenge.');
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return ApiResponse.unauthorized('User not found');
    }

    if (user.status === 'blocked' || user.status === 'suspended') {
      return ApiResponse.forbidden('Your account is suspended.');
    }

    const challenge = await ReadRankChallenge.findById(id);
    if (!challenge || !challenge.isActive) {
      return ApiResponse.notFound('Challenge is not active or does not exist');
    }

    // Verify verified user status if required (default yes)
    if (challenge.requireVerifiedUser && !user.emailVerified) {
      return ApiResponse.forbidden('Please verify your account before joining this challenge.');
    }

    // Verify challenge dates
    const now = new Date();
    if (now < challenge.startDate || now > challenge.endDate) {
      return ApiResponse.error('This challenge is currently closed.', 400);
    }

    // Check existing attempts
    const existingAttempt = await ChallengeAttempt.findOne({
      challengeId: challenge._id,
      userId: user._id,
    }).sort({ createdAt: -1 });

    let attempt;
    if (existingAttempt) {
      // If there's an ongoing attempt and time hasn't run out
      const timeLimitMs = challenge.timeLimitMinutes * 60 * 1000;
      const elapsedMs = now.getTime() - existingAttempt.startedAt.getTime();
      
      if (existingAttempt.status === 'started' && elapsedMs < timeLimitMs + 10000) {
        // Continue existing attempt
        attempt = existingAttempt;
      } else if (!challenge.allowRetake) {
        return ApiResponse.error('You have already attempted this challenge.', 400);
      }
    }

    // Fetch questions
    const questions = await QuestionBank.find({
      _id: { $in: challenge.questionIds },
      isActive: true,
    }).lean();

    if (questions.length === 0) {
      return ApiResponse.error('No questions configured for this challenge', 400);
    }

    if (!attempt) {
      // Create new attempt
      attempt = await ChallengeAttempt.create({
        challengeId: challenge._id,
        blogId: challenge.blogId || null,
        userId: user._id,
        answers: [],
        startedAt: now,
        totalQuestions: questions.length,
        status: 'started',
      });
    }

    // Strip correct option indices
    const safeQuestions = questions.map((q) => ({
      id: q._id.toString(),
      questionText: q.questionText,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty,
      points: q.points,
    }));

    return ApiResponse.success(
      {
        attempt: {
          id: attempt._id.toString(),
          challengeId: attempt.challengeId.toString(),
          startedAt: attempt.startedAt.toISOString(),
          status: attempt.status,
          totalQuestions: attempt.totalQuestions,
          timeLimitMinutes: challenge.timeLimitMinutes,
        },
        questions: safeQuestions,
      },
      'Challenge started successfully'
    );
  } catch (err: any) {
    console.error('Error starting challenge:', err);
    return ApiResponse.serverError(err.message || 'Failed to start challenge');
  }
}

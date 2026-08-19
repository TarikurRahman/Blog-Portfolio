import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ReadRankChallenge from '@/models/ReadRankChallenge';
import QuestionBank from '@/models/QuestionBank';
import ChallengeAttempt from '@/models/ChallengeAttempt';
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

    const payload = await AuthHelper.getAuthPayload();
    if (!payload) {
      return ApiResponse.unauthorized('Not authenticated');
    }

    const challenge = await ReadRankChallenge.findById(id).lean();
    if (!challenge) {
      return ApiResponse.notFound('Challenge not found');
    }

    const attempt = await ChallengeAttempt.findOne({
      challengeId: challenge._id,
      userId: payload.userId,
      status: { $ne: 'started' },
    }).lean();

    if (!attempt) {
      return ApiResponse.notFound('No submitted attempt found for this challenge');
    }

    // If result is published, fetch full details with correct answer explanations,
    // otherwise just return the score and user choices.
    let questionsWithKeys: any[] = [];
    if (challenge.resultPublished) {
      const questions = await QuestionBank.find({
        _id: { $in: challenge.questionIds },
      }).lean();

      questionsWithKeys = questions.map((q) => ({
        id: q._id.toString(),
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        category: q.category,
        difficulty: q.difficulty,
        points: q.points,
      }));
    }

    return ApiResponse.success(
      {
        attempt: {
          id: attempt._id.toString(),
          challengeId: attempt.challengeId.toString(),
          answers: attempt.answers,
          startedAt: attempt.startedAt.toISOString(),
          submittedAt: attempt.submittedAt?.toISOString(),
          timeTakenSeconds: attempt.timeTakenSeconds,
          totalQuestions: attempt.totalQuestions,
          correctAnswers: attempt.correctAnswers,
          wrongAnswers: attempt.wrongAnswers,
          score: attempt.score,
          percentage: attempt.percentage,
          status: attempt.status,
        },
        challenge: {
          title: challenge.title,
          description: challenge.description,
          resultPublished: challenge.resultPublished,
        },
        questions: challenge.resultPublished ? questionsWithKeys : [],
      },
      'Challenge attempt result fetched successfully'
    );
  } catch (err: any) {
    console.error('Error fetching challenge attempt result:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch challenge result');
  }
}

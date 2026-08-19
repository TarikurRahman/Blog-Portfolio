import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
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
      return ApiResponse.unauthorized('Not authenticated');
    }

    const challenge = await ReadRankChallenge.findById(id);
    if (!challenge) {
      return ApiResponse.notFound('Challenge not found');
    }

    // Find the current active attempt
    const attempt = await ChallengeAttempt.findOne({
      challengeId: challenge._id,
      userId: payload.userId,
      status: 'started',
    });

    if (!attempt) {
      return ApiResponse.error('No active attempt found for this challenge. It may have already been submitted or expired.', 400);
    }

    const body = await req.json().catch(() => ({}));
    const { answers = [], autoSubmit = false } = body;

    const submittedAt = new Date();
    const timeTakenSeconds = Math.max(
      1,
      Math.floor((submittedAt.getTime() - attempt.startedAt.getTime()) / 1000)
    );

    const timeLimitSeconds = challenge.timeLimitMinutes * 60;
    // Allow a small 30-second network/client lag buffer
    const isLate = timeTakenSeconds > timeLimitSeconds + 30;

    let finalStatus: 'submitted' | 'auto-submitted' | 'expired' = 'submitted';
    if (autoSubmit || isLate) {
      finalStatus = 'auto-submitted';
    }

    // Fetch the correct answers from DB
    const questions = await QuestionBank.find({
      _id: { $in: challenge.questionIds },
    }).lean();

    const questionsMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let correctAnswers = 0;
    let wrongAnswers = 0;
    let score = 0;

    const gradedAnswers = answers.map((ans: any) => {
      const qId = ans.questionId;
      const selectedIdx = Number(ans.selectedOptionIndex);
      const question = questionsMap.get(qId);

      if (!question) {
        return {
          questionId: qId,
          selectedOptionIndex: selectedIdx,
          isCorrect: false,
          pointsEarned: 0,
        };
      }

      const isCorrect = selectedIdx === question.correctOptionIndex;
      const points = isCorrect ? question.points : 0;

      if (isCorrect) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
      score += points;

      return {
        questionId: qId,
        selectedOptionIndex: selectedIdx,
        isCorrect,
        pointsEarned: points,
      };
    });

    // Handle any missing answers for questions the user did not answer
    questions.forEach((q) => {
      const answered = gradedAnswers.find((ga: any) => ga.questionId === q._id.toString());
      if (!answered) {
        wrongAnswers++;
        gradedAnswers.push({
          questionId: q._id.toString(),
          selectedOptionIndex: -1,
          isCorrect: false,
          pointsEarned: 0,
        });
      }
    });

    const percentage = attempt.totalQuestions > 0 ? (correctAnswers / attempt.totalQuestions) * 100 : 0;

    attempt.answers = gradedAnswers;
    attempt.submittedAt = submittedAt;
    attempt.timeTakenSeconds = timeTakenSeconds;
    attempt.correctAnswers = correctAnswers;
    attempt.wrongAnswers = wrongAnswers;
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.status = finalStatus;

    await attempt.save();

    return ApiResponse.success(
      {
        attempt: {
          id: attempt._id.toString(),
          score: attempt.score,
          correctAnswers: attempt.correctAnswers,
          wrongAnswers: attempt.wrongAnswers,
          percentage: attempt.percentage,
          timeTakenSeconds: attempt.timeTakenSeconds,
          status: attempt.status,
          resultPublished: challenge.resultPublished,
        },
      },
      'Challenge attempt submitted successfully'
    );
  } catch (err: any) {
    console.error('Error submitting challenge attempt:', err);
    return ApiResponse.serverError(err.message || 'Failed to submit challenge attempt');
  }
}

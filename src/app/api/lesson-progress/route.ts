import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import LessonProgress from '@/models/LessonProgress';
import CourseLesson from '@/models/CourseLesson';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload) {
      return ApiResponse.unauthorized('Authentication required to save progress.');
    }

    const body = await req.json().catch(() => ({}));
    const { lessonId, courseId, isCompleted, watchedSeconds } = body;

    if (!lessonId || !courseId) {
      return ApiResponse.error('Lesson ID and Course ID are required.', 400);
    }

    // Verify lesson exists
    const lesson = await CourseLesson.findById(lessonId).lean();
    if (!lesson) {
      return ApiResponse.notFound('Lesson not found');
    }

    let progress = await LessonProgress.findOne({
      userId: payload.userId,
      lessonId
    });

    if (!progress) {
      progress = new LessonProgress({
        userId: payload.userId,
        courseId,
        lessonId,
        watchedSeconds: watchedSeconds || 0,
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : undefined
      });
    } else {
      if (typeof isCompleted === 'boolean') {
        progress.isCompleted = isCompleted;
        if (isCompleted && !progress.completedAt) {
          progress.completedAt = new Date();
        } else if (!isCompleted) {
          progress.completedAt = undefined;
        }
      }
      if (typeof watchedSeconds === 'number') {
        progress.watchedSeconds = watchedSeconds;
      }
    }

    await progress.save();

    return ApiResponse.success(progress, 'Lesson progress updated successfully');
  } catch (err: any) {
    console.error('Update progress error:', err);
    return ApiResponse.serverError('Failed to update progress');
  }
}

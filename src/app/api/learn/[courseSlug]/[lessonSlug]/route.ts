import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import CourseLesson from '@/models/CourseLesson';
import CourseEnrollment from '@/models/CourseEnrollment';
import LessonProgress from '@/models/LessonProgress';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ courseSlug: string; lessonSlug: string }> }
) {
  try {
    await connectDB();
    const { courseSlug, lessonSlug } = await props.params;

    const course = await Course.findOne({ slug: courseSlug, status: 'published' }).lean();
    if (!course) {
      return ApiResponse.notFound('Course not found');
    }

    const lesson = await CourseLesson.findOne({
      courseId: course._id,
      slug: lessonSlug,
      status: 'published'
    }).lean();

    if (!lesson) {
      return ApiResponse.notFound('Lesson not found');
    }

    // Check if user is logged in
    const payload = await AuthHelper.getAuthPayload();
    let hasAccess = false;

    if (payload) {
      const enrollment = await CourseEnrollment.findOne({
        userId: payload.userId,
        courseId: course._id,
        accessStatus: 'active',
      }).lean();

      if (enrollment) {
        hasAccess = true;
      }
    }

    // If it's a paid lesson and user does not have active enrollment, deny access
    if (!lesson.isPreview && !hasAccess) {
      return ApiResponse.forbidden('You do not have access to this premium lesson. Please enroll first.');
    }

    // Fetch progress if logged in
    let progress = null;
    if (payload) {
      progress = await LessonProgress.findOne({
        userId: payload.userId,
        lessonId: lesson._id
      }).lean();
    }

    const formattedLesson = {
      id: lesson._id.toString(),
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description || '',
      youtubeVideoId: lesson.youtubeVideoId, // Securely returned!
      durationMinutes: lesson.durationMinutes,
      isPreview: lesson.isPreview,
      resources: lesson.resources || '',
      isCompleted: progress ? progress.isCompleted : false,
      watchedSeconds: progress ? progress.watchedSeconds : 0
    };

    return ApiResponse.success(formattedLesson, 'Lesson loaded successfully');
  } catch (err: any) {
    console.error('Fetch lesson error:', err);
    return ApiResponse.serverError('Failed to fetch lesson');
  }
}

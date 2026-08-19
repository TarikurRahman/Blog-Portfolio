import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import CourseModule from '@/models/CourseModule';
import CourseLesson from '@/models/CourseLesson';
import CourseEnrollment from '@/models/CourseEnrollment';
import LessonProgress from '@/models/LessonProgress';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest, props: { params: Promise<{ courseSlug: string }> }) {
  try {
    await connectDB();
    const { courseSlug } = await props.params;

    const payload = await AuthHelper.getAuthPayload();
    if (!payload) {
      return ApiResponse.unauthorized('Authentication required to access the learning area.');
    }

    const course = await Course.findOne({ slug: courseSlug, status: 'published' }).lean();
    if (!course) {
      return ApiResponse.notFound('Course not found');
    }

    // Check enrollment access
    const enrollment = await CourseEnrollment.findOne({
      userId: payload.userId,
      courseId: course._id,
      accessStatus: 'active',
    }).lean();

    if (!enrollment) {
      return ApiResponse.forbidden('You do not have access to this course. Please buy or check order status.');
    }

    // Fetch modules
    const modules = await CourseModule.find({ courseId: course._id }).sort({ order: 1 }).lean();

    // Fetch lessons
    const lessons = await CourseLesson.find({ courseId: course._id, status: 'published' }).sort({ order: 1 }).lean();

    // Fetch completed lesson progress
    const progressList = await LessonProgress.find({
      userId: payload.userId,
      courseId: course._id,
      isCompleted: true
    }).select('lessonId').lean();

    const completedLessonIds = progressList.map(p => p.lessonId.toString());

    // Group curriculum structure
    const curriculum = modules.map(m => {
      const moduleLessons = lessons
        .filter(l => l.moduleId.toString() === m._id.toString())
        .map(l => ({
          id: l._id.toString(),
          title: l.title,
          slug: l.slug,
          durationMinutes: l.durationMinutes,
          isPreview: l.isPreview,
          isCompleted: completedLessonIds.includes(l._id.toString())
        }));

      return {
        id: m._id.toString(),
        title: m.title,
        description: m.description || '',
        order: m.order,
        lessons: moduleLessons
      };
    });

    // Calculate total progress percentage
    const totalLessons = lessons.length;
    const completedCount = completedLessonIds.length;
    const progressPercentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

    return ApiResponse.success({
      course: {
        id: course._id.toString(),
        title: course.title,
        slug: course.slug,
        shortDescription: course.shortDescription,
        thumbnailUrl: course.thumbnailUrl,
      },
      progressPercentage,
      curriculum,
      completedLessonIds
    }, 'Curriculum details loaded successfully');
  } catch (err: any) {
    console.error('Fetch learning curriculum error:', err);
    return ApiResponse.serverError('Failed to fetch learning curriculum');
  }
}

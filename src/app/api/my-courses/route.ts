import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseEnrollment from '@/models/CourseEnrollment';
import Course from '@/models/Course';
import LessonProgress from '@/models/LessonProgress';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload) {
      return ApiResponse.unauthorized('Authentication required.');
    }

    const enrollments = await CourseEnrollment.find({ userId: payload.userId })
      .populate('courseId')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = await Promise.all(
      enrollments.map(async (e: any) => {
        const course = e.courseId;
        if (!course) return null;

        // Calculate progress percentage
        const totalLessons = course.totalLessons || 0;
        let completedCount = 0;
        if (totalLessons > 0) {
          completedCount = await LessonProgress.countDocuments({
            userId: payload.userId,
            courseId: course._id,
            isCompleted: true,
          });
        }
        const progressPercentage = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

        return {
          id: course._id.toString(),
          title: course.title,
          slug: course.slug,
          thumbnailUrl: course.thumbnailUrl,
          progressPercentage,
          accessStatus: e.accessStatus,
          paymentStatus: e.paymentStatus,
          enrolledAt: e.enrolledAt,
        };
      })
    );

    // Filter out null values
    const result = formatted.filter(item => item !== null);

    return ApiResponse.success(result, 'My enrolled courses fetched successfully');
  } catch (err: any) {
    console.error('Fetch enrolled courses error:', err);
    return ApiResponse.serverError('Failed to fetch enrolled courses');
  }
}

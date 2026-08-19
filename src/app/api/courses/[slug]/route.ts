import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import CourseModule from '@/models/CourseModule';
import CourseLesson from '@/models/CourseLesson';
import CourseEnrollment from '@/models/CourseEnrollment';
import CourseOrder from '@/models/CourseOrder';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest, props: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const { slug } = await props.params;

    const course = await Course.findOne({ slug, status: 'published' }).lean();
    if (!course) {
      return ApiResponse.notFound('Course not found');
    }

    // Get user payload if logged in
    const payload = await AuthHelper.getAuthPayload();
    let enrollmentStatus = 'none'; // 'none' | 'pending' | 'active' | 'rejected'
    let activeEnrollment = null;

    if (payload) {
      activeEnrollment = await CourseEnrollment.findOne({
        userId: payload.userId,
        courseId: course._id
      }).lean();

      if (activeEnrollment) {
        if (activeEnrollment.accessStatus === 'active') {
          enrollmentStatus = 'active';
        } else if (activeEnrollment.accessStatus === 'pending') {
          enrollmentStatus = 'pending';
        } else if (activeEnrollment.accessStatus === 'revoked') {
          enrollmentStatus = 'rejected';
        }
      } else {
        // Double check if there's any pending order
        const pendingOrder = await CourseOrder.findOne({
          userId: payload.userId,
          courseId: course._id,
          orderStatus: 'pending'
        }).lean();
        if (pendingOrder) {
          enrollmentStatus = 'pending';
        }
      }
    }

    // Fetch modules
    const modules = await CourseModule.find({ courseId: course._id }).sort({ order: 1 }).lean();

    // Fetch lessons
    const lessons = await CourseLesson.find({ courseId: course._id, status: 'published' }).sort({ order: 1 }).lean();

    // Group lessons by module and sanitize video IDs
    const curriculum = modules.map(m => {
      const moduleLessons = lessons
        .filter(l => l.moduleId.toString() === m._id.toString())
        .map(l => ({
          id: l._id.toString(),
          title: l.title,
          slug: l.slug,
          description: l.description || '',
          durationMinutes: l.durationMinutes,
          isPreview: l.isPreview,
          // Only return YouTube video ID if it's marked as preview
          youtubeVideoId: l.isPreview ? l.youtubeVideoId : '',
        }));

      return {
        id: m._id.toString(),
        title: m.title,
        description: m.description || '',
        order: m.order,
        lessons: moduleLessons
      };
    });

    const courseDetails = {
      id: course._id.toString(),
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      bannerUrl: course.bannerUrl || '',
      price: course.price,
      salePrice: course.salePrice,
      category: course.category,
      level: course.level,
      totalDurationMinutes: course.totalDurationMinutes,
      totalLessons: course.totalLessons,
      isFeatured: course.isFeatured,
      badge: course.badge || 'none',
      whatYouWillLearn: course.whatYouWillLearn || [],
      requirements: course.requirements || [],
      faq: course.faq || [],
      enrollmentStatus,
      curriculum
    };

    return ApiResponse.success(courseDetails, 'Course details fetched successfully');
  } catch (err: any) {
    console.error('Fetch course details error:', err);
    return ApiResponse.serverError('Failed to fetch course details');
  }
}

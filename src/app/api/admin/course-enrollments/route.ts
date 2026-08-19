import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseEnrollment from '@/models/CourseEnrollment';
import User from '@/models/User';
import Course from '@/models/Course';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const enrollments = await CourseEnrollment.find()
      .populate('userId', 'name email')
      .populate('courseId', 'title slug')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = enrollments.map((e: any) => ({
      id: e._id.toString(),
      user: e.userId ? {
        id: e.userId._id.toString(),
        name: e.userId.name,
        email: e.userId.email
      } : { id: '', name: 'Unknown User', email: 'unknown@user.com' },
      course: e.courseId ? {
        id: e.courseId._id.toString(),
        title: e.courseId.title,
        slug: e.courseId.slug
      } : { id: '', title: 'Unknown Course', slug: '' },
      accessStatus: e.accessStatus,
      paymentStatus: e.paymentStatus,
      enrolledAt: e.enrolledAt,
    }));

    return ApiResponse.success(formatted, 'Enrollments fetched successfully');
  } catch (err: any) {
    console.error('Fetch enrollments error:', err);
    return ApiResponse.serverError('Failed to fetch enrollments');
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const body = await req.json().catch(() => ({}));
    const { userEmail, courseId } = body;

    if (!userEmail || !courseId) {
      return ApiResponse.error('User email and Course ID are required.', 400);
    }

    const user = await User.findOne({ email: userEmail.toLowerCase().trim() });
    if (!user) {
      return ApiResponse.notFound(`User with email "${userEmail}" not found.`);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponse.notFound('Course not found');
    }

    const enrollment = await CourseEnrollment.findOneAndUpdate(
      { userId: user._id, courseId: course._id },
      {
        userId: user._id,
        courseId: course._id,
        accessStatus: 'active',
        paymentStatus: 'approved',
        enrolledAt: new Date()
      },
      { upsert: true, new: true }
    );

    return ApiResponse.success(enrollment, 'User enrolled successfully', 201);
  } catch (err: any) {
    console.error('Manual enrollment error:', err);
    return ApiResponse.serverError(err.message || 'Failed to enroll user');
  }
}

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseOrder from '@/models/CourseOrder';
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

    const orders = await CourseOrder.find()
      .populate('userId', 'name email')
      .populate('courseId', 'title slug')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = orders.map((o: any) => ({
      id: o._id.toString(),
      orderNumber: o.orderNumber,
      user: o.userId ? {
        id: o.userId._id.toString(),
        name: o.userId.name,
        email: o.userId.email
      } : { id: '', name: 'Unknown User', email: 'unknown@user.com' },
      course: o.courseId ? {
        id: o.courseId._id.toString(),
        title: o.courseId.title,
        slug: o.courseId.slug
      } : { id: '', title: 'Unknown Course', slug: '' },
      amount: o.amount,
      paymentMethod: o.paymentMethod,
      transactionId: o.transactionId || '',
      paymentScreenshotUrl: o.paymentScreenshotUrl || '',
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      adminNote: o.adminNote || '',
      createdAt: o.createdAt,
    }));

    return ApiResponse.success(formatted, 'Course orders fetched successfully');
  } catch (err: any) {
    console.error('Fetch admin orders error:', err);
    return ApiResponse.serverError('Failed to fetch orders');
  }
}

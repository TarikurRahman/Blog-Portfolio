import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseOrder from '@/models/CourseOrder';
import Course from '@/models/Course';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload) {
      return ApiResponse.unauthorized('Authentication required.');
    }

    const orders = await CourseOrder.find({ userId: payload.userId })
      .populate('courseId', 'title slug thumbnailUrl')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = orders.map((o: any) => ({
      id: o._id.toString(),
      orderNumber: o.orderNumber,
      courseTitle: o.courseId?.title || 'Unknown Course',
      courseSlug: o.courseId?.slug || '',
      courseThumbnail: o.courseId?.thumbnailUrl || '',
      amount: o.amount,
      paymentMethod: o.paymentMethod,
      transactionId: o.transactionId || '',
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      adminNote: o.adminNote || '',
      createdAt: o.createdAt,
    }));

    return ApiResponse.success(formatted, 'My orders fetched successfully');
  } catch (err: any) {
    console.error('Fetch my orders error:', err);
    return ApiResponse.serverError('Failed to fetch my orders');
  }
}

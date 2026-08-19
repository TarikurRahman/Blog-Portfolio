import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseOrder from '@/models/CourseOrder';
import Course from '@/models/Course';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload) {
      return ApiResponse.unauthorized('Authentication required to purchase courses.');
    }

    const body = await req.json().catch(() => ({}));
    const { courseId, amount, paymentMethod, transactionId, paymentScreenshotUrl } = body;

    if (!courseId || !amount || !paymentMethod) {
      return ApiResponse.error('Course ID, amount, and payment method are required.', 400);
    }

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return ApiResponse.notFound('Course not found');
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await CourseOrder.create({
      orderNumber,
      userId: payload.userId,
      courseId,
      amount,
      paymentMethod,
      transactionId: transactionId || '',
      paymentScreenshotUrl: paymentScreenshotUrl || '',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      adminNote: '',
    });

    return ApiResponse.success(newOrder, 'Order submitted successfully for review', 201);
  } catch (err: any) {
    console.error('Submit order error:', err);
    return ApiResponse.serverError(err.message || 'Failed to submit order');
  }
}

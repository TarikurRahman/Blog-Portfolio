import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseOrder from '@/models/CourseOrder';
import CourseEnrollment from '@/models/CourseEnrollment';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;

    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const order = await CourseOrder.findById(id);
    if (!order) {
      return ApiResponse.notFound('Order not found');
    }

    const body = await req.json().catch(() => ({}));
    const { orderStatus, paymentStatus, adminNote } = body;

    if (orderStatus !== undefined) order.orderStatus = orderStatus;
    if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
    if (adminNote !== undefined) order.adminNote = adminNote;

    await order.save();

    // If order is approved, automatically create/update enrollment
    if (order.orderStatus === 'approved') {
      await CourseEnrollment.findOneAndUpdate(
        { userId: order.userId, courseId: order.courseId },
        {
          userId: order.userId,
          courseId: order.courseId,
          orderId: order._id,
          accessStatus: 'active',
          paymentStatus: 'approved',
          enrolledAt: new Date()
        },
        { upsert: true, new: true }
      );
    } else if (order.orderStatus === 'rejected' || order.orderStatus === 'cancelled') {
      // If rejected or cancelled, revoke enrollment if it exists
      await CourseEnrollment.findOneAndUpdate(
        { userId: order.userId, courseId: order.courseId },
        {
          accessStatus: 'revoked',
          paymentStatus: 'rejected'
        }
      );
    }

    return ApiResponse.success(order, 'Order updated successfully');
  } catch (err: any) {
    console.error('Update order error:', err);
    return ApiResponse.serverError(err.message || 'Failed to update order');
  }
}

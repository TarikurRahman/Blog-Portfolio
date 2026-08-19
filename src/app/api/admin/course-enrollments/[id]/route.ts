import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
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

    const enrollment = await CourseEnrollment.findById(id);
    if (!enrollment) {
      return ApiResponse.notFound('Enrollment not found');
    }

    const body = await req.json().catch(() => ({}));
    const { accessStatus, paymentStatus } = body;

    if (accessStatus !== undefined) enrollment.accessStatus = accessStatus;
    if (paymentStatus !== undefined) enrollment.paymentStatus = paymentStatus;

    await enrollment.save();

    return ApiResponse.success(enrollment, 'Enrollment updated successfully');
  } catch (err: any) {
    console.error('Update enrollment error:', err);
    return ApiResponse.serverError(err.message || 'Failed to update enrollment');
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;

    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const enrollment = await CourseEnrollment.findByIdAndDelete(id);
    if (!enrollment) {
      return ApiResponse.notFound('Enrollment not found');
    }

    return ApiResponse.success(null, 'Enrollment deleted successfully');
  } catch (err: any) {
    console.error('Delete enrollment error:', err);
    return ApiResponse.serverError('Failed to delete enrollment');
  }
}

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseModule from '@/models/CourseModule';
import CourseLesson from '@/models/CourseLesson';
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

    const courseModule = await CourseModule.findById(id);
    if (!courseModule) {
      return ApiResponse.notFound('Module not found');
    }

    const body = await req.json().catch(() => ({}));
    const { title, description, order } = body;

    if (title !== undefined) courseModule.title = title;
    if (description !== undefined) courseModule.description = description;
    if (order !== undefined) courseModule.order = Number(order) || 0;

    await courseModule.save();

    return ApiResponse.success(courseModule, 'Module updated successfully');
  } catch (err: any) {
    console.error('Update module error:', err);
    return ApiResponse.serverError(err.message || 'Failed to update module');
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

    const courseModule = await CourseModule.findByIdAndDelete(id);
    if (!courseModule) {
      return ApiResponse.notFound('Module not found');
    }

    // Delete associated lessons
    await CourseLesson.deleteMany({ moduleId: id });

    return ApiResponse.success(null, 'Module and its lessons deleted successfully');
  } catch (err: any) {
    console.error('Delete module error:', err);
    return ApiResponse.serverError('Failed to delete module');
  }
}

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseModule from '@/models/CourseModule';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    if (!courseId) {
      return ApiResponse.error('Course ID is required.', 400);
    }

    const modules = await CourseModule.find({ courseId }).sort({ order: 1 }).lean();
    const formatted = modules.map((m: any) => ({
      id: m._id.toString(),
      courseId: m.courseId.toString(),
      title: m.title,
      description: m.description || '',
      order: m.order,
    }));

    return ApiResponse.success(formatted, 'Modules fetched successfully');
  } catch (err: any) {
    console.error('Fetch modules error:', err);
    return ApiResponse.serverError('Failed to fetch modules');
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
    const { courseId, title, description, order } = body;

    if (!courseId || !title) {
      return ApiResponse.error('Course ID and title are required.', 400);
    }

    const newModule = await CourseModule.create({
      courseId,
      title,
      description: description || '',
      order: Number(order) || 0,
    });

    return ApiResponse.success(newModule, 'Module created successfully', 201);
  } catch (err: any) {
    console.error('Create module error:', err);
    return ApiResponse.serverError(err.message || 'Failed to create module');
  }
}

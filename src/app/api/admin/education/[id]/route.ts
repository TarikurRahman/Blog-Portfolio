import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Education from '@/models/Education';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { degree, institution, duration, description } = body;

    const education = await Education.findById(id);
    if (!education) {
      return ApiResponse.notFound('Education entry not found');
    }

    if (degree !== undefined) education.degree = degree;
    if (institution !== undefined) education.institution = institution;
    if (duration !== undefined) education.duration = duration;
    if (description !== undefined) education.description = description;

    await education.save();

    return ApiResponse.success(education, 'Education entry updated successfully');
  } catch (err: any) {
    console.error('Update education error:', err);
    return ApiResponse.serverError(err.message || 'Failed to update education');
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = params;
    const deleted = await Education.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound('Education entry not found');
    }

    return ApiResponse.success({}, 'Education entry deleted successfully');
  } catch (err: any) {
    console.error('Delete education error:', err);
    return ApiResponse.serverError(err.message || 'Failed to delete education');
  }
}

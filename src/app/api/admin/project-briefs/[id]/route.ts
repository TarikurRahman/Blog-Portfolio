import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProjectBrief from '@/models/ProjectBrief';
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
    if (!id) {
      return ApiResponse.error('Brief ID is required', 400);
    }

    const body = await req.json().catch(() => ({}));
    const { status } = body;

    if (!status || !['new', 'contacted', 'converted', 'rejected'].includes(status)) {
      return ApiResponse.error('Valid status is required', 400);
    }

    const updated = await ProjectBrief.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!updated) {
      return ApiResponse.notFound('Project brief not found');
    }

    return ApiResponse.success(updated, 'Project brief status updated successfully');
  } catch (err: any) {
    console.error('Error updating project brief status:', err);
    return ApiResponse.serverError(err.message || 'Failed to update project brief');
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
    if (!id) {
      return ApiResponse.error('Brief ID is required', 400);
    }

    const deleted = await ProjectBrief.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound('Project brief not found');
    }

    return ApiResponse.success({}, 'Project brief deleted successfully');
  } catch (err: any) {
    console.error('Error deleting project brief:', err);
    return ApiResponse.serverError(err.message || 'Failed to delete project brief');
  }
}

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Experience from '@/models/Experience';
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
    const { role, company, duration, description, tags } = body;

    const experience = await Experience.findById(id);
    if (!experience) {
      return ApiResponse.notFound('Experience not found');
    }

    if (role !== undefined) experience.role = role;
    if (company !== undefined) experience.company = company;
    if (duration !== undefined) experience.duration = duration;
    if (description !== undefined) experience.description = description;
    if (tags !== undefined) experience.tags = tags;

    await experience.save();

    return ApiResponse.success(experience, 'Experience updated successfully');
  } catch (err: any) {
    console.error('Update experience error:', err);
    return ApiResponse.serverError(err.message || 'Failed to update experience');
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
    const deleted = await Experience.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound('Experience not found');
    }

    return ApiResponse.success({}, 'Experience deleted successfully');
  } catch (err: any) {
    console.error('Delete experience error:', err);
    return ApiResponse.serverError(err.message || 'Failed to delete experience');
  }
}

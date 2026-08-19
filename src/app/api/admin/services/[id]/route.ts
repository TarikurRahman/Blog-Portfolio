import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
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
    const { title, iconName, description, bullets } = body;

    const service = await Service.findById(id);
    if (!service) {
      return ApiResponse.notFound('Service not found');
    }

    if (title !== undefined) service.title = title;
    if (iconName !== undefined) service.iconName = iconName;
    if (description !== undefined) service.description = description;
    if (bullets !== undefined) service.bullets = bullets;

    await service.save();

    return ApiResponse.success(service, 'Service updated successfully');
  } catch (err: any) {
    console.error('Update service error:', err);
    return ApiResponse.serverError(err.message || 'Failed to update service');
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
    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound('Service not found');
    }

    return ApiResponse.success({}, 'Service deleted successfully');
  } catch (err: any) {
    console.error('Delete service error:', err);
    return ApiResponse.serverError(err.message || 'Failed to delete service');
  }
}

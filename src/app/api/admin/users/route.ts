import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    const formatted = users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status === 'blocked' ? 'suspended' : u.status,
      avatar: u.avatarUrl,
      createdAt: u.createdAt.toISOString(),
    }));

    return ApiResponse.success(formatted, 'Users fetched successfully');
  } catch (err: any) {
    console.error('Fetch admin users error:', err);
    return ApiResponse.serverError('Failed to fetch users');
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const body = await req.json().catch(() => ({}));
    const { id, role, status } = body;
    if (!id) {
      return ApiResponse.error('User ID is required', 400);
    }

    if (id === payload.userId) {
      return ApiResponse.error('You cannot modify your own administrative credentials or status.', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return ApiResponse.notFound('User not found');
    }

    const updates: any = {};
    if (role) updates.role = role;
    if (status) {
      updates.status = status === 'suspended' ? 'blocked' : status;
    }

    const updated = await User.findByIdAndUpdate(id, { $set: updates }, { new: true });
    return ApiResponse.success(updated, 'User settings modified successfully');
  } catch (err: any) {
    console.error('Update user settings error:', err);
    return ApiResponse.serverError('Failed to modify user configuration');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return ApiResponse.error('User ID is required', 400);
    }

    if (id === payload.userId) {
      return ApiResponse.error('You cannot delete your own administrative session.', 400);
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound('User not found');
    }

    return ApiResponse.success({}, 'User deleted successfully');
  } catch (err: any) {
    console.error('Delete user error:', err);
    return ApiResponse.serverError('Failed to delete user');
  }
}

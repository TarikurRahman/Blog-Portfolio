import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Skill from '@/models/Skill';
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
    const { name, category, level, iconName } = body;

    const skill = await Skill.findById(id);
    if (!skill) {
      return ApiResponse.notFound('Skill not found');
    }

    if (name !== undefined) skill.name = name;
    if (category !== undefined) skill.category = category;
    if (level !== undefined) skill.level = Number(level);
    if (iconName !== undefined) skill.iconName = iconName;

    await skill.save();

    return ApiResponse.success(skill, 'Skill updated successfully');
  } catch (err: any) {
    console.error('Update skill error:', err);
    return ApiResponse.serverError(err.message || 'Failed to update skill');
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
    const deleted = await Skill.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound('Skill not found');
    }

    return ApiResponse.success({}, 'Skill deleted successfully');
  } catch (err: any) {
    console.error('Delete skill error:', err);
    return ApiResponse.serverError(err.message || 'Failed to delete skill');
  }
}

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Skill from '@/models/Skill';
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
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }

    const total = await Skill.countDocuments(filter);
    const skills = await Skill.find(filter).sort({ category: 1, level: -1 }).skip(skip).limit(limit).lean();

    const formatted = skills.map(s => ({
      id: s._id.toString(),
      name: s.name,
      category: s.category,
      level: s.level,
      iconName: s.iconName,
    }));

    return ApiResponse.success({
      skills: formatted,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (err: any) {
    console.error('Admin fetch skills error:', err);
    return ApiResponse.serverError('Failed to fetch skills');
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
    const { name, category, level, iconName } = body;

    if (!name || !category || level === undefined || !iconName) {
      return ApiResponse.error('Name, category, level, and iconName are required fields.', 400);
    }

    const skill = await Skill.create({
      name,
      category,
      level: Number(level),
      iconName,
    });

    return ApiResponse.success(skill, 'Skill created successfully', 201);
  } catch (err: any) {
    console.error('Create skill error:', err);
    return ApiResponse.serverError(err.message || 'Failed to create skill');
  }
}

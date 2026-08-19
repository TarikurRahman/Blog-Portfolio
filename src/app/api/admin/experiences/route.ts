import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Experience from '@/models/Experience';
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (search) {
      filter.$or = [
        { role: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Experience.countDocuments(filter);
    const experiences = await Experience.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    const formatted = experiences.map(e => ({
      id: e._id.toString(),
      role: e.role,
      company: e.company,
      duration: e.duration,
      description: e.description,
      tags: e.tags || [],
    }));

    return ApiResponse.success({
      experiences: formatted,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (err: any) {
    console.error('Admin fetch experiences error:', err);
    return ApiResponse.serverError('Failed to fetch experiences');
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
    const { role, company, duration, description, tags } = body;

    if (!role || !company || !duration || !description) {
      return ApiResponse.error('Role, company, duration, and description are required fields.', 400);
    }

    const experience = await Experience.create({
      role,
      company,
      duration,
      description,
      tags: tags || [],
    });

    return ApiResponse.success(experience, 'Experience created successfully', 201);
  } catch (err: any) {
    console.error('Create experience error:', err);
    return ApiResponse.serverError(err.message || 'Failed to create experience');
  }
}

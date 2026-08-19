import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const skip = (page - 1) * limit;

    const total = await Service.countDocuments();
    const services = await Service.find().sort({ createdAt: 1 }).skip(skip).limit(limit).lean();

    const formatted = services.map(s => ({
      id: s._id.toString(),
      title: s.title,
      iconName: s.iconName,
      description: s.description,
      bullets: s.bullets || [],
    }));

    return ApiResponse.success({
      services: formatted,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (err: any) {
    console.error('Admin fetch services error:', err);
    return ApiResponse.serverError('Failed to fetch services');
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
    const { title, iconName, description, bullets } = body;

    if (!title || !iconName || !description) {
      return ApiResponse.error('Title, iconName, and description are required fields.', 400);
    }

    const service = await Service.create({
      title,
      iconName,
      description,
      bullets: bullets || [],
    });

    return ApiResponse.success(service, 'Service created successfully', 201);
  } catch (err: any) {
    console.error('Create service error:', err);
    return ApiResponse.serverError(err.message || 'Failed to create service');
  }
}

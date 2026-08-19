import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Education from '@/models/Education';
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
        { degree: { $regex: search, $options: 'i' } },
        { institution: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Education.countDocuments(filter);
    const education = await Education.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    const formatted = education.map(edu => ({
      id: edu._id.toString(),
      degree: edu.degree,
      institution: edu.institution,
      duration: edu.duration,
      description: edu.description,
    }));

    return ApiResponse.success({
      education: formatted,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (err: any) {
    console.error('Admin fetch education error:', err);
    return ApiResponse.serverError('Failed to fetch education');
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
    const { degree, institution, duration, description } = body;

    if (!degree || !institution || !duration || !description) {
      return ApiResponse.error('Degree, institution, duration, and description are required fields.', 400);
    }

    const education = await Education.create({
      degree,
      institution,
      duration,
      description,
    });

    return ApiResponse.success(education, 'Education entry created successfully', 201);
  } catch (err: any) {
    console.error('Create education error:', err);
    return ApiResponse.serverError(err.message || 'Failed to create education');
  }
}

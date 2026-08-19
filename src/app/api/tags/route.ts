import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tag from '@/models/Tag';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET() {
  try {
    await connectDB();
    const tags = await Tag.find({}).lean();
    return ApiResponse.success(tags, 'Tags fetched successfully');
  } catch (err: any) {
    console.error('Fetch tags error:', err);
    return ApiResponse.serverError('Failed to fetch tags');
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
    const { name } = body;
    if (!name || !name.trim()) {
      return ApiResponse.error('Tag name is required', 400);
    }

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const exists = await Tag.findOne({ slug });
    if (exists) {
      return ApiResponse.error('Tag already exists', 400);
    }

    const tag = await Tag.create({ name: name.trim(), slug });
    return ApiResponse.success(tag, 'Tag created successfully', 201);
  } catch (err: any) {
    console.error('Create tag error:', err);
    return ApiResponse.serverError('Failed to create tag');
  }
}

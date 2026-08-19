import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET() {
  try {
    await connectDB();
    let categories = await Category.find({}).lean();
    if (categories.length === 0) {
      const defaults = ['Frontend', 'Shopify', 'Bubble.io', 'SEO', 'UI/UX'];
      categories = await Category.insertMany(
        defaults.map(name => ({
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }))
      );
    }
    return ApiResponse.success(categories, 'Categories fetched successfully');
  } catch (err: any) {
    console.error('Fetch categories error:', err);
    return ApiResponse.serverError('Failed to fetch categories');
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
      return ApiResponse.error('Category name is required', 400);
    }

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const exists = await Category.findOne({ slug });
    if (exists) {
      return ApiResponse.error('Category already exists', 400);
    }

    const category = await Category.create({ name: name.trim(), slug });
    return ApiResponse.success(category, 'Category created successfully', 201);
  } catch (err: any) {
    console.error('Create category error:', err);
    return ApiResponse.serverError('Failed to create category');
  }
}

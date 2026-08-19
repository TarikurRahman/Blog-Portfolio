import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Experience from '@/models/Experience';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const experiences = await Experience.find().sort({ createdAt: -1 }).lean();

    const formatted = experiences.map(e => ({
      id: e._id.toString(),
      role: e.role,
      company: e.company,
      duration: e.duration,
      description: e.description,
      tags: e.tags || [],
    }));

    return ApiResponse.success(formatted, 'Experiences fetched successfully');
  } catch (err: any) {
    console.error('Fetch experiences error:', err);
    return ApiResponse.serverError('Failed to fetch experiences');
  }
}

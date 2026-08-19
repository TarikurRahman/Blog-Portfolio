import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const services = await Service.find().sort({ createdAt: 1 }).lean();

    const formatted = services.map(s => ({
      id: s._id.toString(),
      title: s.title,
      iconName: s.iconName,
      description: s.description,
      bullets: s.bullets || [],
    }));

    return ApiResponse.success(formatted, 'Services fetched successfully');
  } catch (err: any) {
    console.error('Fetch services error:', err);
    return ApiResponse.serverError('Failed to fetch services');
  }
}

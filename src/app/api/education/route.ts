import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Education from '@/models/Education';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const education = await Education.find().sort({ createdAt: -1 }).lean();

    const formatted = education.map(edu => ({
      id: edu._id.toString(),
      degree: edu.degree,
      institution: edu.institution,
      duration: edu.duration,
      description: edu.description,
    }));

    return ApiResponse.success(formatted, 'Education fetched successfully');
  } catch (err: any) {
    console.error('Fetch education error:', err);
    return ApiResponse.serverError('Failed to fetch education');
  }
}

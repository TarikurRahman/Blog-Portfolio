import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Skill from '@/models/Skill';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const skills = await Skill.find().sort({ level: -1, name: 1 }).lean();

    const formatted = skills.map(s => ({
      id: s._id.toString(),
      name: s.name,
      category: s.category,
      level: s.level,
      iconName: s.iconName,
    }));

    return ApiResponse.success(formatted, 'Skills fetched successfully');
  } catch (err: any) {
    console.error('Fetch skills error:', err);
    return ApiResponse.serverError('Failed to fetch skills');
  }
}

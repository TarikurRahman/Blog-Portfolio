import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { ApiResponse } from '@/lib/api-response';

export async function GET() {
  try {
    await connectDB();
    let projects = await Project.find({ isFeatured: true }).limit(3).lean();
    if (projects.length === 0) {
      projects = await Project.find({}).sort({ createdAt: -1 }).limit(3).lean();
    }

    const formatted = projects.map(p => ({
      id: p._id.toString(),
      title: p.title,
      slug: p.slug,
      category: p.category,
      description: p.shortDescription,
      longDescription: p.fullDescription,
      tags: p.technologies,
      image: p.coverImage,
      status: p.status,
      liveUrl: p.liveUrl || '',
      githubUrl: p.githubUrl || '',
      features: p.features || [],
      challenge: p.challenge || '',
      solution: p.solution || '',
    }));

    return ApiResponse.success(formatted, 'Featured projects fetched successfully');
  } catch (err: any) {
    console.error('Fetch featured projects error:', err);
    return ApiResponse.serverError('Failed to fetch featured projects');
  }
}

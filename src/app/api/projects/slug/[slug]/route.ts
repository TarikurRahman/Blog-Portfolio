import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB();
    const { slug } = await params;
    const project = await Project.findOne({ slug }).lean();
    if (!project) {
      return ApiResponse.notFound('Project not found');
    }

    const formatted = {
      id: project._id.toString(),
      title: project.title,
      slug: project.slug,
      category: project.category,
      description: project.shortDescription,
      longDescription: project.fullDescription,
      tags: project.technologies,
      image: project.coverImage,
      status: project.status,
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      features: project.features || [],
      challenge: project.challenge || '',
      solution: project.solution || '',
      seoTitle: project.seoTitle || '',
      seoDescription: project.seoDescription || '',
      seoKeywords: project.seoKeywords || '',
    };

    return ApiResponse.success(formatted, 'Project fetched successfully by slug');
  } catch (err: any) {
    console.error('Fetch project by slug error:', err);
    return ApiResponse.serverError('Failed to fetch project');
  }
}

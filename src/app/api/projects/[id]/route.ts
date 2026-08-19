import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';
import { serverCache } from '@/lib/server-cache';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const project = await Project.findById(id).lean();
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

    return ApiResponse.success(formatted, 'Project fetched successfully');
  } catch (err: any) {
    console.error('Fetch project error:', err);
    return ApiResponse.serverError('Failed to fetch project');
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { title, category, shortDescription, description, longDescription, fullDescription, coverImage, image, technologies, tags, features, liveUrl, githubUrl, status, isFeatured, challenge, solution, seoTitle, seoDescription, seoKeywords } = body;

    const project = await Project.findById(id);
    if (!project) {
      return ApiResponse.notFound('Project not found');
    }

    const updateFields: any = {};
    if (title) updateFields.title = title;
    if (category) updateFields.category = category;
    if (shortDescription || description) updateFields.shortDescription = shortDescription || description;
    if (longDescription || fullDescription) updateFields.fullDescription = longDescription || fullDescription;
    if (coverImage || image) updateFields.coverImage = coverImage || image;
    if (technologies || tags) {
      updateFields.technologies = technologies || (typeof tags === 'string' ? (tags as string).split(',').map((t: string) => t.trim()) : tags) || [];
    }
    if (features) updateFields.features = features;
    if (liveUrl !== undefined) updateFields.liveUrl = liveUrl;
    if (githubUrl !== undefined) updateFields.githubUrl = githubUrl;
    if (status) updateFields.status = status;
    if (isFeatured !== undefined) updateFields.isFeatured = isFeatured;
    if (challenge !== undefined) updateFields.challenge = challenge;
    if (solution !== undefined) updateFields.solution = solution;
    if (seoTitle !== undefined) updateFields.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateFields.seoDescription = seoDescription;
    if (seoKeywords !== undefined) updateFields.seoKeywords = seoKeywords;

    const updated = await Project.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    
    // Invalidate caches
    serverCache.clear();

    return ApiResponse.success(updated, 'Project updated successfully');
  } catch (err: any) {
    console.error('Update project error:', err);
    return ApiResponse.serverError('Failed to update project');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = await params;
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound('Project not found');
    }

    // Invalidate caches
    serverCache.clear();

    return ApiResponse.success(null, 'Project deleted successfully');
  } catch (err: any) {
    console.error('Delete project error:', err);
    return ApiResponse.serverError('Failed to delete project');
  }
}

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuestionBank from '@/models/QuestionBank';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = params;
    const question = await QuestionBank.findById(id).lean();
    if (!question) {
      return ApiResponse.notFound('Question not found');
    }

    return ApiResponse.success(question, 'Question fetched successfully');
  } catch (err: any) {
    console.error('Error fetching admin question details:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch question details');
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));

    const question = await QuestionBank.findById(id);
    if (!question) {
      return ApiResponse.notFound('Question not found');
    }

    const {
      questionText,
      options,
      correctOptionIndex,
      category,
      blogId,
      difficulty,
      points,
      isActive,
    } = body;

    if (questionText !== undefined) question.questionText = questionText;
    if (options !== undefined) {
      if (options.length < 2) {
        return ApiResponse.error('Options must contain at least 2 choices', 400);
      }
      question.options = options;
    }
    if (correctOptionIndex !== undefined) question.correctOptionIndex = Number(correctOptionIndex);
    if (category !== undefined) question.category = category;
    if (blogId !== undefined) question.blogId = blogId || null;
    if (difficulty !== undefined) question.difficulty = difficulty;
    if (points !== undefined) question.points = Number(points);
    if (isActive !== undefined) question.isActive = isActive;

    await question.save();

    return ApiResponse.success(question, 'Question updated successfully');
  } catch (err: any) {
    console.error('Error updating admin question:', err);
    return ApiResponse.serverError(err.message || 'Failed to update question');
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = params;
    const deleted = await QuestionBank.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound('Question not found');
    }

    return ApiResponse.success({}, 'Question deleted successfully');
  } catch (err: any) {
    console.error('Error deleting admin question:', err);
    return ApiResponse.serverError(err.message || 'Failed to delete question');
  }
}

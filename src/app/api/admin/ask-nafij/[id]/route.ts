import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import AskTarikurQuestion from '@/models/AskNafijQuestion';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { id } = params;
    const question = await AskTarikurQuestion.findById(id);
    if (!question) {
      return ApiResponse.notFound('Question not found');
    }

    const body = await req.json().catch(() => ({}));
    const { answer, category, tags, status, isFeatured } = body;

    if (answer !== undefined) {
      question.answer = answer;
      question.answeredAt = new Date();
      // Auto transition status if answered
      if (question.status === 'pending' && answer.trim()) {
        question.status = 'answered';
      }
    }
    if (category !== undefined) question.category = category;
    if (tags !== undefined) question.tags = tags;
    if (status !== undefined) {
      question.status = status;
      if (status === 'published' && !question.publishedAt) {
        question.publishedAt = new Date();
      }
    }
    if (isFeatured !== undefined) question.isFeatured = !!isFeatured;

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
    const deleted = await AskTarikurQuestion.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound('Question not found');
    }

    return ApiResponse.success({}, 'Question deleted successfully');
  } catch (err: any) {
    console.error('Error deleting admin question:', err);
    return ApiResponse.serverError(err.message || 'Failed to delete question');
  }
}

import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import AskTarikurQuestion from '@/models/AskNafijQuestion';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { question: { $regex: search, $options: 'i' } },
      ];
    }

    const totalQuestions = await AskTarikurQuestion.countDocuments(query);
    const questions = await AskTarikurQuestion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formatted = questions.map((q) => ({
      id: q._id.toString(),
      name: q.name,
      email: q.email,
      userId: q.userId?.toString() || null,
      question: q.question,
      answer: q.answer,
      category: q.category,
      tags: q.tags || [],
      status: q.status,
      isFeatured: q.isFeatured,
      publishedAt: q.publishedAt ? q.publishedAt.toISOString() : null,
      answeredAt: q.answeredAt ? q.answeredAt.toISOString() : null,
      createdAt: q.createdAt.toISOString(),
    }));

    return ApiResponse.success(
      {
        questions: formatted,
        pagination: {
          total: totalQuestions,
          page,
          limit,
          pages: Math.ceil(totalQuestions / limit),
        },
      },
      'Questions fetched successfully'
    );
  } catch (err: any) {
    console.error('Error fetching admin questions:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch questions');
  }
}

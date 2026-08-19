import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import QuestionBank from '@/models/QuestionBank';
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
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.questionText = { $regex: search, $options: 'i' };
    }

    const totalQuestions = await QuestionBank.countDocuments(query);
    const questions = await QuestionBank.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formatted = questions.map((q) => ({
      id: q._id.toString(),
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      category: q.category,
      blogId: q.blogId?.toString() || null,
      difficulty: q.difficulty,
      points: q.points,
      isActive: q.isActive,
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

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const body = await req.json().catch(() => ({}));
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

    if (!questionText || !options || options.length < 2 || correctOptionIndex === undefined || !category) {
      return ApiResponse.error('Missing required fields or invalid options length', 400);
    }

    const newQuestion = await QuestionBank.create({
      questionText,
      options,
      correctOptionIndex: Number(correctOptionIndex),
      category,
      blogId: blogId || null,
      difficulty: difficulty || 'Medium',
      points: Number(points) || 10,
      isActive: isActive !== undefined ? isActive : true,
    });

    return ApiResponse.success(newQuestion, 'Question created successfully', 201);
  } catch (err: any) {
    console.error('Error creating question:', err);
    return ApiResponse.serverError(err.message || 'Failed to create question');
  }
}

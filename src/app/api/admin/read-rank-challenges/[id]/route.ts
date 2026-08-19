import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ReadRankChallenge from '@/models/ReadRankChallenge';
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
    const challenge = await ReadRankChallenge.findById(id).populate('blogId', 'title slug').lean();
    if (!challenge) {
      return ApiResponse.notFound('Challenge not found');
    }

    return ApiResponse.success(challenge, 'Challenge details fetched successfully');
  } catch (err: any) {
    console.error('Error fetching admin challenge details:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch challenge details');
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

    const challenge = await ReadRankChallenge.findById(id);
    if (!challenge) {
      return ApiResponse.notFound('Challenge not found');
    }

    const {
      blogId,
      title,
      description,
      questionIds,
      questionSourceType,
      category,
      totalQuestions,
      timeLimitMinutes,
      startDate,
      endDate,
      durationDays,
      isActive,
      allowRetake,
      requireVerifiedUser,
      resultPublished,
      showOnHome,
    } = body;

    if (blogId !== undefined) challenge.blogId = blogId || null;
    if (title !== undefined) challenge.title = title;
    if (description !== undefined) challenge.description = description;
    if (questionIds !== undefined) challenge.questionIds = questionIds;
    if (questionSourceType !== undefined) challenge.questionSourceType = questionSourceType;
    if (category !== undefined) challenge.category = category;
    if (totalQuestions !== undefined) challenge.totalQuestions = Number(totalQuestions);
    if (timeLimitMinutes !== undefined) challenge.timeLimitMinutes = Number(timeLimitMinutes);
    if (startDate !== undefined) challenge.startDate = new Date(startDate);
    if (endDate !== undefined) challenge.endDate = new Date(endDate);
    if (durationDays !== undefined) challenge.durationDays = Number(durationDays);
    if (isActive !== undefined) challenge.isActive = isActive;
    if (allowRetake !== undefined) challenge.allowRetake = allowRetake;
    if (requireVerifiedUser !== undefined) challenge.requireVerifiedUser = requireVerifiedUser;
    if (resultPublished !== undefined) challenge.resultPublished = resultPublished;
    if (showOnHome !== undefined) challenge.showOnHome = showOnHome;

    await challenge.save();

    return ApiResponse.success(challenge, 'Challenge updated successfully');
  } catch (err: any) {
    console.error('Error updating admin challenge:', err);
    return ApiResponse.serverError(err.message || 'Failed to update challenge');
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
    const deleted = await ReadRankChallenge.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound('Challenge not found');
    }

    return ApiResponse.success({}, 'Challenge deleted successfully');
  } catch (err: any) {
    console.error('Error deleting admin challenge:', err);
    return ApiResponse.serverError(err.message || 'Failed to delete challenge');
  }
}

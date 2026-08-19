import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseLesson from '@/models/CourseLesson';
import Course from '@/models/Course';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';
import { generateUniqueSlug } from '@/lib/slugify';

function extractYoutubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.') && !trimmed.includes('?')) {
    return trimmed;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2].length === 11) ? match[2] : trimmed;
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;

    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const lesson = await CourseLesson.findById(id);
    if (!lesson) {
      return ApiResponse.notFound('Lesson not found');
    }

    const body = await req.json().catch(() => ({}));
    const { title, description, youtubeUrlOrId, durationMinutes, isPreview, resources, order, status } = body;

    if (title && title !== lesson.title) {
      lesson.slug = await generateUniqueSlug(title, CourseLesson, id);
      lesson.title = title;
    }

    if (description !== undefined) lesson.description = description;
    if (youtubeUrlOrId !== undefined && youtubeUrlOrId !== '') {
      const videoId = extractYoutubeId(youtubeUrlOrId);
      if (videoId) {
        lesson.youtubeVideoId = videoId;
      }
    }
    if (durationMinutes !== undefined) lesson.durationMinutes = Number(durationMinutes) || 0;
    if (isPreview !== undefined) lesson.isPreview = isPreview;
    if (resources !== undefined) lesson.resources = resources;
    if (order !== undefined) lesson.order = Number(order) || 0;
    if (status !== undefined) lesson.status = status;

    await lesson.save();

    // Recalculate totals
    const allCourseLessons = await CourseLesson.find({ courseId: lesson.courseId, status: 'published' }).lean();
    const totalLessons = allCourseLessons.length;
    const totalDurationMinutes = allCourseLessons.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

    await Course.findByIdAndUpdate(lesson.courseId, { totalLessons, totalDurationMinutes });

    return ApiResponse.success(lesson, 'Lesson updated successfully');
  } catch (err: any) {
    console.error('Update lesson error:', err);
    return ApiResponse.serverError(err.message || 'Failed to update lesson');
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await props.params;

    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const lesson = await CourseLesson.findByIdAndDelete(id);
    if (!lesson) {
      return ApiResponse.notFound('Lesson not found');
    }

    // Recalculate totals
    const allCourseLessons = await CourseLesson.find({ courseId: lesson.courseId, status: 'published' }).lean();
    const totalLessons = allCourseLessons.length;
    const totalDurationMinutes = allCourseLessons.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

    await Course.findByIdAndUpdate(lesson.courseId, { totalLessons, totalDurationMinutes });

    return ApiResponse.success(null, 'Lesson deleted successfully');
  } catch (err: any) {
    console.error('Delete lesson error:', err);
    return ApiResponse.serverError('Failed to delete lesson');
  }
}

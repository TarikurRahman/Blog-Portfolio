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

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');

    const filter: any = {};
    if (courseId) filter.courseId = courseId;
    if (moduleId) filter.moduleId = moduleId;

    if (!courseId) {
      return ApiResponse.error('Course ID is required.', 400);
    }

    const lessons = await CourseLesson.find(filter).sort({ order: 1 }).lean();
    const formatted = lessons.map((l: any) => ({
      id: l._id.toString(),
      courseId: l.courseId.toString(),
      moduleId: l.moduleId.toString(),
      title: l.title,
      slug: l.slug,
      description: l.description || '',
      youtubeVideoId: l.youtubeVideoId,
      durationMinutes: l.durationMinutes,
      isPreview: l.isPreview,
      resources: l.resources || '',
      order: l.order,
      status: l.status,
    }));

    return ApiResponse.success(formatted, 'Lessons fetched successfully');
  } catch (err: any) {
    console.error('Fetch lessons error:', err);
    return ApiResponse.serverError('Failed to fetch lessons');
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
    const { courseId, moduleId, title, description, youtubeUrlOrId, durationMinutes, isPreview, resources, order, status } = body;

    if (!courseId || !moduleId || !title || !youtubeUrlOrId) {
      return ApiResponse.error('Course ID, Module ID, title, and YouTube URL/ID are required.', 400);
    }

    const videoId = extractYoutubeId(youtubeUrlOrId);
    if (!videoId) {
      return ApiResponse.error('Invalid YouTube video URL or ID.', 400);
    }

    const slug = await generateUniqueSlug(title, CourseLesson);

    const newLesson = await CourseLesson.create({
      courseId,
      moduleId,
      title,
      slug,
      description: description || '',
      youtubeVideoId: videoId,
      durationMinutes: Number(durationMinutes) || 0,
      isPreview: isPreview || false,
      resources: resources || '',
      order: Number(order) || 0,
      status: status || 'draft',
    });

    // Update course totals (totalLessons, totalDurationMinutes)
    const allCourseLessons = await CourseLesson.find({ courseId, status: 'published' }).lean();
    const totalLessons = allCourseLessons.length;
    const totalDurationMinutes = allCourseLessons.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

    await Course.findByIdAndUpdate(courseId, { totalLessons, totalDurationMinutes });

    return ApiResponse.success(newLesson, 'Lesson created successfully', 201);
  } catch (err: any) {
    console.error('Create lesson error:', err);
    return ApiResponse.serverError(err.message || 'Failed to create lesson');
  }
}

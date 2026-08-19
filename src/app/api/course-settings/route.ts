import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseSettings from '@/models/CourseSettings';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    let settings = await CourseSettings.findOne().lean();
    if (!settings) {
      // Return default settings if none exist
      settings = {
        homeBannerTitle: 'Start Learning Practical Web Development',
        homeBannerSubtitle: 'Learn by building real projects with clear step-by-step lessons.',
        homeBannerImageUrl: '',
        homeBannerCtaText: 'Explore Courses',
        homeBannerCtaLink: '/courses',
        paymentInstructions: 'Please send the course amount to one of our mobile banking numbers and fill up the checkout form.',
        paymentMethods: [
          { name: 'bKash', details: 'Personal: 01700000000', status: 'active' },
          { name: 'Nagad', details: 'Personal: 01800000000', status: 'active' }
        ],
        supportContact: 'support@tarikurrahman.com',
        showCourseSectionOnHome: true,
      } as any;
    }
    return ApiResponse.success(settings, 'Course settings fetched successfully');
  } catch (err: any) {
    console.error('Fetch course settings error:', err);
    return ApiResponse.serverError('Failed to fetch course settings');
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const body = await req.json().catch(() => ({}));
    let settings = await CourseSettings.findOne();
    if (!settings) {
      settings = new CourseSettings(body);
    } else {
      Object.assign(settings, body);
    }
    await settings.save();

    return ApiResponse.success(settings, 'Course settings updated successfully');
  } catch (err: any) {
    console.error('Update course settings error:', err);
    return ApiResponse.serverError('Failed to update course settings');
  }
}

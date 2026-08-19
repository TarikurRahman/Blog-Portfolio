import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import PageMedia from '@/models/PageMedia';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const body = await req.json().catch(() => ({}));
    const { homeHeroImageUrl, aboutHeroImageUrl, aboutBottomBannerImageUrl } = body;

    let media = await PageMedia.findOne();

    if (!media) {
      media = new PageMedia({
        homeHeroImageUrl: homeHeroImageUrl || '',
        aboutHeroImageUrl: aboutHeroImageUrl || '',
        aboutBottomBannerImageUrl: aboutBottomBannerImageUrl || '',
      });
    } else {
      if (homeHeroImageUrl !== undefined) media.homeHeroImageUrl = homeHeroImageUrl;
      if (aboutHeroImageUrl !== undefined) media.aboutHeroImageUrl = aboutHeroImageUrl;
      if (aboutBottomBannerImageUrl !== undefined) media.aboutBottomBannerImageUrl = aboutBottomBannerImageUrl;
    }

    await media.save();

    return ApiResponse.success(media, 'Page media configurations updated successfully');
  } catch (err: any) {
    console.error('Error updating page media:', err);
    return ApiResponse.serverError(err.message || 'Failed to update page media');
  }
}
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    let media = await PageMedia.findOne().lean();
    if (!media) {
      media = {
        homeHeroImageUrl: '',
        aboutHeroImageUrl: '',
        aboutBottomBannerImageUrl: '',
      } as any;
    }

    return ApiResponse.success(media, 'Page media configurations fetched successfully');
  } catch (err: any) {
    console.error('Error fetching admin page media:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch page media');
  }
}

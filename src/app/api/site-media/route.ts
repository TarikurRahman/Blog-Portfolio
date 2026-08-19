import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import PageMedia from '@/models/PageMedia';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    let media = await PageMedia.findOne().lean();

    const fallbackHomeHero = '/nafij-islam.jpg';
    const fallbackAboutHero = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&q=80';
    const fallbackAboutBottom = '/bannerimg-DAerhh9n.jpeg';

    if (!media) {
      return ApiResponse.success({
        homeHeroImageUrl: fallbackHomeHero,
        aboutHeroImageUrl: fallbackAboutHero,
        aboutBottomBannerImageUrl: fallbackAboutBottom,
      });
    }

    return ApiResponse.success({
      homeHeroImageUrl: media.homeHeroImageUrl || fallbackHomeHero,
      aboutHeroImageUrl: media.aboutHeroImageUrl || fallbackAboutHero,
      aboutBottomBannerImageUrl: media.aboutBottomBannerImageUrl || fallbackAboutBottom,
    });
  } catch (err: any) {
    console.error('Error fetching page media:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch page media');
  }
}

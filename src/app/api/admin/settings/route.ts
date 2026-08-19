import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET() {
  try {
    await connectDB();
    let settings = await SiteSettings.findOne({});
    if (!settings) {
      settings = await SiteSettings.create({});
    }

    const formatted = {
      websiteTitle: settings.websiteTitle,
      logoText: settings.logoText,
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      heroIntro: settings.heroIntro,
      aboutBadge: settings.aboutBadge,
      aboutTitle: settings.aboutTitle,
      aboutBio: settings.aboutBio,
      aboutDescription: settings.aboutDescription,
      cvUrl: settings.cvUrl,
      email: settings.email,
      phone: settings.phone,
      location: settings.location,
      availability: settings.availability,
      githubUrl: settings.githubUrl,
      linkedinUrl: settings.linkedinUrl,
      twitterUrl: settings.twitterUrl,
      seoMetaTitle: settings.seoMetaTitle,
      seoMetaDescription: settings.seoMetaDescription,
      seoKeywords: settings.seoKeywords,
    };

    return ApiResponse.success(formatted, 'Settings fetched successfully');
  } catch (err: any) {
    console.error('Fetch settings error:', err);
    return ApiResponse.serverError('Failed to fetch settings');
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
    
    const updateFields: any = {};
    if (body.websiteTitle !== undefined) updateFields.websiteTitle = body.websiteTitle;
    if (body.logoText !== undefined) updateFields.logoText = body.logoText;
    if (body.heroTitle !== undefined) updateFields.heroTitle = body.heroTitle;
    if (body.heroSubtitle !== undefined) updateFields.heroSubtitle = body.heroSubtitle;
    if (body.heroIntro !== undefined) updateFields.heroIntro = body.heroIntro;
    if (body.aboutBadge !== undefined) updateFields.aboutBadge = body.aboutBadge;
    if (body.aboutTitle !== undefined) updateFields.aboutTitle = body.aboutTitle;
    if (body.aboutBio !== undefined) updateFields.aboutBio = body.aboutBio;
    if (body.aboutDescription !== undefined) updateFields.aboutDescription = body.aboutDescription;
    if (body.cvUrl !== undefined) updateFields.cvUrl = body.cvUrl;
    if (body.email !== undefined) updateFields.email = body.email;
    if (body.phone !== undefined) updateFields.phone = body.phone;
    if (body.location !== undefined) updateFields.location = body.location;
    if (body.availability !== undefined) updateFields.availability = body.availability;
    if (body.githubUrl !== undefined) updateFields.githubUrl = body.githubUrl;
    if (body.linkedinUrl !== undefined) updateFields.linkedinUrl = body.linkedinUrl;
    if (body.twitterUrl !== undefined) updateFields.twitterUrl = body.twitterUrl;
    if (body.seoMetaTitle !== undefined) updateFields.seoMetaTitle = body.seoMetaTitle;
    if (body.seoMetaDescription !== undefined) updateFields.seoMetaDescription = body.seoMetaDescription;
    if (body.seoKeywords !== undefined) updateFields.seoKeywords = body.seoKeywords;

    let settings = await SiteSettings.findOne({});
    if (!settings) {
      settings = await SiteSettings.create(updateFields);
    } else {
      settings = await SiteSettings.findByIdAndUpdate(settings._id, { $set: updateFields }, { new: true });
    }

    // Invalidate server cache
    const { serverCache } = await import('@/lib/server-cache');
    serverCache.clear();

    return ApiResponse.success(settings, 'Settings updated successfully');
  } catch (err: any) {
    console.error('Update settings error:', err);
    return ApiResponse.serverError('Failed to update settings');
  }
}

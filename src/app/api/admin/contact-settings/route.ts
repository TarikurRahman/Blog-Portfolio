import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactSettings from '@/models/ContactSettings';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const body = await req.json().catch(() => ({}));

    const updateFields: any = {};
    const allowedKeys = [
      'title',
      'subtitle',
      'introText',
      'email',
      'phone',
      'location',
      'availabilityText',
      'githubUrl',
      'linkedinUrl',
      'twitterUrl',
      'formNameLabel',
      'formNamePlaceholder',
      'formEmailLabel',
      'formEmailPlaceholder',
      'formSubjectLabel',
      'formSubjectPlaceholder',
      'formMessageLabel',
      'formMessagePlaceholder',
      'successMessage',
    ];

    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        updateFields[key] = body[key];
      }
    }

    let settings = await ContactSettings.findOne({});
    if (!settings) {
      settings = await ContactSettings.create(updateFields);
    } else {
      settings = await ContactSettings.findByIdAndUpdate(
        settings._id,
        { $set: updateFields },
        { new: true }
      );
    }

    return ApiResponse.success(settings, 'Contact settings updated successfully');
  } catch (err: any) {
    console.error('Update contact settings error:', err);
    return ApiResponse.serverError('Failed to update contact settings');
  }
}

import connectDB from '@/lib/mongodb';
import ContactSettings from '@/models/ContactSettings';
import { ApiResponse } from '@/lib/api-response';

export async function GET() {
  try {
    await connectDB();
    let settings = await ContactSettings.findOne({}).lean();
    if (!settings) {
      const newSettings = await ContactSettings.create({});
      settings = newSettings.toObject ? newSettings.toObject() : newSettings;
    }
    return ApiResponse.success(settings, 'Contact settings retrieved successfully');
  } catch (err: any) {
    console.error('Fetch contact settings error:', err);
    return ApiResponse.serverError('Failed to fetch contact settings');
  }
}

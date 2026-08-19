import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload) {
      return ApiResponse.unauthorized('Unauthorized access. Please log in.');
    }

    const messages = await ContactMessage.find({ email: payload.email.toLowerCase().trim() })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = messages.map(m => ({
      id: m._id.toString(),
      name: m.name,
      email: m.email,
      subject: m.subject,
      message: m.message,
      replyMessage: m.replyMessage || '',
      repliedAt: m.repliedAt ? m.repliedAt.toISOString() : null,
      date: m.createdAt.toISOString(),
      read: m.status !== 'new',
      status: m.status || 'new',
    }));

    return ApiResponse.success(formatted, 'My contact messages fetched successfully');
  } catch (err: any) {
    console.error('Fetch my contact messages error:', err);
    return ApiResponse.serverError('Failed to fetch your messages');
  }
}

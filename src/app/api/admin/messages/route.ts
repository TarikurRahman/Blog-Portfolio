import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
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
    const { id, status, read, replyMessage } = body;

    if (!id) {
      return ApiResponse.error('Message ID is required', 400);
    }

    const message = await ContactMessage.findById(id);
    if (!message) {
      return ApiResponse.notFound('Message not found');
    }

    const updates: any = {};
    if (replyMessage !== undefined) {
      updates.replyMessage = replyMessage;
      updates.repliedAt = new Date();
      updates.status = 'replied';
    } else if (status) {
      updates.status = status;
    } else if (read !== undefined) {
      updates.status = read ? 'read' : 'new';
    }

    const updated = await ContactMessage.findByIdAndUpdate(id, { $set: updates }, { new: true });
    return ApiResponse.success(updated, 'Message status updated successfully');
  } catch (err: any) {
    console.error('Update contact message status error:', err);
    return ApiResponse.serverError('Failed to update message status');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return ApiResponse.error('Message ID is required', 400);
    }

    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) {
      return ApiResponse.notFound('Message not found');
    }

    return ApiResponse.success({}, 'Message deleted successfully');
  } catch (err: any) {
    console.error('Delete message error:', err);
    return ApiResponse.serverError('Failed to delete message');
  }
}

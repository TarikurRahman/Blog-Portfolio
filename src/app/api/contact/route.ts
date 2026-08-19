import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';
import { Validators } from '@/lib/validators';
import { sendNotificationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { name, email, subject, message } = body;

    const validationError = Validators.validateContactMessage(name, email, subject, message);
    if (validationError) {
      return ApiResponse.error(validationError, 400);
    }

    const newMessage = await ContactMessage.create({
      name,
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
    });

    // Send email alert to Gmail
    const emailSubject = `[Portfolio Contact] - New Message from ${name}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff; color: #333333;">
        <h2 style="color: #ff653f; border-bottom: 2px solid #ff653f; padding-bottom: 10px; margin-top: 0;">New Contact Message</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 120px; border-bottom: 1px solid #f9f9f9;">Name:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f9f9f9;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9;">Email:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f9f9f9;"><a href="mailto:${email}" style="color: #ff653f; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9;">Subject:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f9f9f9; font-weight: 500;">${subject}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ff653f; border-radius: 4px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #444444;">
${message}
        </div>
        <p style="font-size: 11px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; text-align: center;">
          This message was sent from your portfolio website's contact form.
        </p>
      </div>
    `;
    
    // Await the email dispatch to ensure the serverless container does not terminate prematurely
    await sendNotificationEmail(emailSubject, emailHtml);

    const formatted = {
      id: newMessage._id.toString(),
      name: newMessage.name,
      email: newMessage.email,
      subject: newMessage.subject,
      message: newMessage.message,
      date: newMessage.createdAt.toISOString(),
      read: false,
    };

    return ApiResponse.success(formatted, 'Your message has been sent successfully!', 201);
  } catch (err: any) {
    console.error('Contact submit error:', err);
    return ApiResponse.serverError('Failed to send message. Please try again.');
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const messages = await ContactMessage.find({}).sort({ createdAt: -1 }).lean();

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

    return ApiResponse.success(formatted, 'Contact messages fetched successfully');
  } catch (err: any) {
    console.error('Fetch contact messages error:', err);
    return ApiResponse.serverError('Failed to fetch messages');
  }
}

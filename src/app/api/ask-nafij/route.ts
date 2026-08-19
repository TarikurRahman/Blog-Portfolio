import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import AskTarikurQuestion from '@/models/AskNafijQuestion';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';
import { sendNotificationEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const featuredOnly = searchParams.get('featured') === 'true';

    // Base query: only published answers
    const query: any = { status: 'published' };
    if (featuredOnly) {
      query.isFeatured = true;
    }
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
      ];
    }

    const qas = await AskTarikurQuestion.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    const formatted = qas.map((qa) => ({
      id: qa._id.toString(),
      name: qa.name,
      question: qa.question,
      answer: qa.answer,
      category: qa.category,
      tags: qa.tags || [],
      isFeatured: qa.isFeatured,
      publishedAt: qa.publishedAt ? qa.publishedAt.toISOString() : null,
    }));

    // Suggest related answers if a search term is specified
    let suggestions: any[] = [];
    if (search && formatted.length > 0) {
      const firstResultCategory = formatted[0].category;
      const firstResultId = formatted[0].id;

      const related = await AskTarikurQuestion.find({
        status: 'published',
        category: firstResultCategory,
        _id: { $ne: firstResultId },
      })
        .limit(3)
        .lean();

      suggestions = related.map((r) => ({
        id: r._id.toString(),
        question: r.question,
        category: r.category,
      }));
    }

    return ApiResponse.success(
      {
        qas: formatted,
        suggestions,
      },
      'Published Q&As fetched successfully'
    );
  } catch (err: any) {
    console.error('Error fetching public Q&As:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch Q&As');
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { question, category, tags } = body;

    if (!question) {
      return ApiResponse.error('Question is required', 400);
    }

    const payload = await AuthHelper.getAuthPayload();
    let name = body.name;
    let email = body.email;
    let userId = null;

    if (payload) {
      // Use logged in user details,
      name = payload.email.split('@')[0]; // Fallback in case name isn't supplied
      email = payload.email;
      userId = payload.userId;

      // Try to find full name from database
      const User = (await import('@/models/User')).default;
      const userObj = await User.findById(payload.userId).lean();
      if (userObj) {
        name = userObj.name;
      }
    } else {
      if (!name || !email) {
        return ApiResponse.error('Name and email are required for guests', 400);
      }
    }

    const newQA = await AskTarikurQuestion.create({
      name,
      email,
      userId,
      question,
      category: category || 'General',
      tags: tags || [],
      status: 'pending',
      isFeatured: false,
    });

    // Send Q&A email alert to Gmail
    const qaCategory = category || 'General';
    const emailSubject = `[Portfolio Q&A] - New Question from ${name}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #ffffff; color: #333333;">
        <h2 style="color: #ff653f; border-bottom: 2px solid #ff653f; padding-bottom: 10px; margin-top: 0;">New Q&A Question Submitted</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 150px; border-bottom: 1px solid #f9f9f9;">Submitter Name:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f9f9f9;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9;">Submitter Email:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f9f9f9;"><a href="mailto:${email}" style="color: #ff653f; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f9f9f9;">Category:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f9f9f9; font-weight: 500;">${qaCategory}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ff653f; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #444444; white-space: pre-wrap;">
          <strong>Question:</strong><br/>
${question}
        </div>
        <p style="font-size: 11px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px; text-align: center;">
          You can reply to this question or approve it directly from your portfolio admin dashboard under the "Ask Tarikur" tab.
        </p>
      </div>
    `;

    // Await the email dispatch to ensure the serverless container does not terminate prematurely
    await sendNotificationEmail(emailSubject, emailHtml);

    return ApiResponse.success(newQA, 'Question submitted successfully. Waiting for response.', 201);
  } catch (err: any) {
    console.error('Error submitting question:', err);
    return ApiResponse.serverError(err.message || 'Failed to submit question');
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VisitorEvent from '@/models/VisitorEvent';
import { AuthHelper } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, sessionId, pageUrl, pageTitle, referrer, device, browser, userAgent } = body;

    // Lightweight checks
    if (!visitorId || !sessionId || !pageUrl || !device || !browser) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user is logged in
    let userId: string | undefined;
    try {
      const payload = await AuthHelper.getAuthPayload();
      if (payload && payload.userId) {
        userId = payload.userId;
      }
    } catch (authErr) {
      // Ignore auth parsing issues for public analytics tracking
    }

    // Record the visitor event
    await VisitorEvent.create({
      visitorId,
      sessionId,
      userId,
      pageUrl,
      pageTitle: pageTitle || '',
      referrer: referrer || '',
      device,
      browser,
      userAgent,
      visitedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Tracking event recorded successfully',
    });
  } catch (error: any) {
    console.error('Visitor analytics tracking error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Failed to record tracking event' },
      { status: 500 }
    );
  }
}

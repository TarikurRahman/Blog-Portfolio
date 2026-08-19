import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import VisitorEvent from '@/models/VisitorEvent';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Enforce admin-only access
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    // 1. Aggregate top 5 most viewed pages
    const mostViewedPages = await VisitorEvent.aggregate([
      {
        $group: {
          _id: '$pageUrl',
          pageTitle: { $first: '$pageTitle' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          pageUrl: '$_id',
          pageTitle: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 2. Aggregate device statistics
    const deviceStats = await VisitorEvent.aggregate([
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          device: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 3. Aggregate top browsers
    const browserStats = await VisitorEvent.aggregate([
      {
        $group: {
          _id: '$browser',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          browser: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 4. Retrieve recent 10 visitor events
    const recentVisits = await VisitorEvent.find()
      .sort({ visitedAt: -1 })
      .limit(10)
      .populate('userId', 'name email avatarUrl')
      .lean();

    const analyticsData = {
      mostViewedPages,
      deviceStats,
      browserStats,
      recentVisits,
    };

    return ApiResponse.success(analyticsData, 'Analytics data fetched successfully');
  } catch (err: any) {
    console.error('Fetch admin analytics error:', err);
    return ApiResponse.serverError('Failed to fetch admin analytics data');
  }
}

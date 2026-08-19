import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Blog from '@/models/Blog';
import Project from '@/models/Project';
import Like from '@/models/Like';
import Comment from '@/models/Comment';
import ContactMessage from '@/models/ContactMessage';
import MediaAsset from '@/models/MediaAsset';
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

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Start of current week (Sunday)
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentDay = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);

    // Start of current month (1st day)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Active now (last 5 minutes)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // 1. Visitor Stats
    const [
      totalPageViews,
      totalUniqueList,
      todayUniqueList,
      weekUniqueList,
      monthUniqueList,
      activeNowList
    ] = await Promise.all([
      VisitorEvent.countDocuments(),
      VisitorEvent.distinct('visitorId'),
      VisitorEvent.distinct('visitorId', { visitedAt: { $gte: startOfToday } }),
      VisitorEvent.distinct('visitorId', { visitedAt: { $gte: startOfWeek } }),
      VisitorEvent.distinct('visitorId', { visitedAt: { $gte: startOfMonth } }),
      VisitorEvent.distinct('visitorId', { visitedAt: { $gte: fiveMinutesAgo } }),
    ]);

    // 2. User Stats
    const [
      totalUsers,
      newUsersToday,
      activeUsers,
      blockedUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'blocked' }),
    ]);

    // 3. Blog Stats
    const [
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      archivedBlogs
    ] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Blog.countDocuments({ status: 'archived' }),
    ]);

    // 4. Project Stats
    const [
      totalProjects,
      publishedProjects,
      draftProjects,
      archivedProjects
    ] = await Promise.all([
      Project.countDocuments(),
      // Handle either 'Completed' or 'published' status for projects
      Project.countDocuments({ status: { $in: ['Completed', 'published'] } }),
      Project.countDocuments({ status: 'In Progress' }),
      Project.countDocuments({ status: 'archived' }),
    ]);

    // 5. Engagement Stats
    const [
      totalLikes,
      totalComments,
      pendingComments,
      approvedComments
    ] = await Promise.all([
      Like.countDocuments(),
      Comment.countDocuments(),
      Comment.countDocuments({ status: 'pending' }),
      Comment.countDocuments({ status: 'approved' }),
    ]);

    // 6. Messages Stats
    const [
      totalMessages,
      newMessages,
      readMessages,
      archivedMessages
    ] = await Promise.all([
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ status: 'new' }),
      ContactMessage.countDocuments({ status: 'read' }),
      ContactMessage.countDocuments({ status: 'archived' }),
    ]);

    // 7. Media Stats
    const totalMediaUploads = await MediaAsset.countDocuments();

    const overviewStats = {
      visitors: {
        totalPageViews,
        totalUniqueVisitors: totalUniqueList.length,
        todayVisitors: todayUniqueList.length,
        thisWeekVisitors: weekUniqueList.length,
        thisMonthVisitors: monthUniqueList.length,
        activeVisitorsNow: activeNowList.length,
      },
      users: {
        totalUsers,
        newUsersToday,
        activeUsers,
        blockedUsers,
      },
      blogs: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        archivedBlogs,
      },
      projects: {
        totalProjects,
        publishedProjects,
        draftProjects,
        archivedProjects,
      },
      engagement: {
        totalLikes,
        totalComments,
        pendingComments,
        approvedComments,
      },
      messages: {
        totalMessages,
        newMessages,
        readMessages,
        archivedMessages,
      },
      media: {
        totalMediaUploads,
      },
    };

    return ApiResponse.success(overviewStats, 'Overview stats fetched successfully');
  } catch (err: any) {
    console.error('Fetch admin overview stats error:', err);
    return ApiResponse.serverError('Failed to fetch admin overview stats');
  }
}

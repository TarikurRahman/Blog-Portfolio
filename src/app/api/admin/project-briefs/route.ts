import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProjectBrief from '@/models/ProjectBrief';
import { AuthHelper } from '@/lib/auth';
import { ApiResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const payload = await AuthHelper.getAuthPayload();
    if (!payload || payload.role !== 'admin') {
      return ApiResponse.forbidden('Access forbidden. Admins only.');
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { projectType: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch stats
    const statsArray = await ProjectBrief.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      total: 0,
      new: 0,
      contacted: 0,
      converted: 0,
      rejected: 0,
    };

    statsArray.forEach((item) => {
      const statusKey = item._id as keyof typeof stats;
      if (statusKey in stats) {
        stats[statusKey] = item.count;
      }
    });
    stats.total = stats.new + stats.contacted + stats.converted + stats.rejected;

    const totalBriefs = await ProjectBrief.countDocuments(query);
    const briefs = await ProjectBrief.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedBriefs = briefs.map((b) => ({
      id: b._id.toString(),
      name: b.name,
      email: b.email,
      whatsapp: b.whatsapp,
      businessUrl: b.businessUrl,
      projectType: b.projectType,
      projectSize: b.projectSize,
      selectedFeatures: b.selectedFeatures,
      designStyle: b.designStyle,
      timeline: b.timeline,
      budgetRange: b.budgetRange,
      complexityScore: b.complexityScore,
      estimatedPackage: b.estimatedPackage,
      estimatedTimeline: b.estimatedTimeline,
      generatedSummary: b.generatedSummary,
      extraMessage: b.extraMessage,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    }));

    return ApiResponse.success(
      {
        briefs: formattedBriefs,
        pagination: {
          total: totalBriefs,
          page,
          limit,
          pages: Math.ceil(totalBriefs / limit),
        },
        stats,
      },
      'Project briefs fetched successfully'
    );
  } catch (err: any) {
    console.error('Error fetching admin project briefs:', err);
    return ApiResponse.serverError(err.message || 'Failed to fetch project briefs');
  }
}

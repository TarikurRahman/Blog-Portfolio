import { NextRequest } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import Blog from '@/models/Blog';
import Service from '@/models/Service';
import Skill from '@/models/Skill';
import Experience from '@/models/Experience';
import PageMedia from '@/models/PageMedia';
import ReadRankChallenge from '@/models/ReadRankChallenge';
import ChallengeAttempt from '@/models/ChallengeAttempt';
import AskTarikurQuestion from '@/models/AskNafijQuestion';
import SiteReview from '@/models/SiteReview';
import Course from '@/models/Course';
import CourseSettings from '@/models/CourseSettings';
import SiteSettings from '@/models/SiteSettings';
import { ApiResponse } from '@/lib/api-response';
import { serverCache } from '@/lib/server-cache';

export async function GET(req: NextRequest) {
  try {
    const cacheKey = 'home:all-data';
    const cachedData = serverCache.get<any>(cacheKey);
    if (cachedData) {
      return ApiResponse.success(cachedData, 'All homepage data retrieved from cache');
    }

    await connectDB();

    // Perform queries in parallel
    const [
      dbSettings,
      projectsRaw,
      blogsRaw,
      servicesRaw,
      skillsRaw,
      experiencesRaw,
      mediaRaw,
      latestChallenge,
      featuredQAsRaw,
      featuredReviewsRaw,
      featuredCoursesRaw,
      courseSettingsRaw,
    ] = await Promise.all([
      SiteSettings.findOne({}).lean(),
      
      // Projects: get featured or fallback to latest 3
      Project.find({ isFeatured: true }).limit(3).lean()
        .then(async (projs) => projs.length === 0 ? Project.find({}).sort({ createdAt: -1 }).limit(3).lean() : projs),

      // Blogs: get featured or fallback to top 3 liked
      Blog.find({ status: 'published', isFeatured: true }).populate('author', 'name avatarUrl role').limit(3).lean()
        .then(async (blgs) => blgs.length === 0 ? Blog.find({ status: 'published' }).populate('author', 'name avatarUrl role').sort({ likesCount: -1 }).limit(3).lean() : blgs),

      Service.find().sort({ createdAt: 1 }).lean(),
      Skill.find().sort({ level: -1, name: 1 }).lean(),
      Experience.find().sort({ createdAt: -1 }).lean(),
      PageMedia.findOne().lean(),
      ReadRankChallenge.findOne({ isActive: true, resultPublished: true }).sort({ updatedAt: -1 }).lean(),
      AskTarikurQuestion.find({ status: 'published', isFeatured: true }).sort({ publishedAt: -1, createdAt: -1 }).limit(3).lean(),
      SiteReview.find({ status: 'approved', isFeatured: true }).sort({ createdAt: -1 }).limit(3).lean(),
      Course.find({ status: 'published', isFeatured: true }).sort({ createdAt: -1 }).limit(3).lean(),
      CourseSettings.findOne().lean(),
    ]);

    // Format Projects
    const projects = (projectsRaw || []).map((p: any) => ({
      id: p._id.toString(),
      title: p.title,
      slug: p.slug,
      category: p.category,
      description: p.shortDescription,
      longDescription: p.fullDescription,
      tags: p.technologies,
      image: p.coverImage,
      status: p.status,
      liveUrl: p.liveUrl || '',
      githubUrl: p.githubUrl || '',
      features: p.features || [],
      challenge: p.challenge || '',
      solution: p.solution || '',
    }));

    // Format Blogs
    const blogs = (blogsRaw || []).map((b: any) => ({
      id: b._id.toString(),
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      category: b.category,
      tags: b.tags,
      author: b.author ? {
        id: b.author._id.toString(),
        name: b.author.name,
        avatar: b.author.avatarUrl,
        role: b.author.role === 'admin' ? 'Administrator' : 'User'
      } : { id: '', name: 'Author', avatar: '', role: 'User' },
      date: (b.publishedAt || b.createdAt).toISOString().split('T')[0],
      readTime: b.readTime,
      likes: b.likesCount,
      commentsCount: b.commentsCount,
      image: b.featuredImage?.url || '',
      status: b.status === 'published' ? 'Published' : 'Draft',
    }));

    // Format Services
    const services = (servicesRaw || []).map((s: any) => ({
      id: s._id.toString(),
      title: s.title,
      iconName: s.iconName,
      description: s.description,
      bullets: s.bullets || [],
    }));

    // Format Skills
    const skills = (skillsRaw || []).map((s: any) => ({
      id: s._id.toString(),
      name: s.name,
      category: s.category,
      level: s.level,
      iconName: s.iconName,
    }));

    // Format Experiences
    const experiences = (experiencesRaw || []).map((e: any) => ({
      id: e._id.toString(),
      role: e.role,
      company: e.company,
      duration: e.duration,
      description: e.description,
      tags: e.tags || [],
    }));

    // Format Media
      const fallbackHomeHero = '/nafij-islam.jpg';
    const fallbackAboutHero = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&q=80';
    const fallbackAboutBottom = '/bannerimg-DAerhh9n.jpeg';
    
    const pageMedia = mediaRaw ? {
      homeHeroImageUrl: mediaRaw.homeHeroImageUrl || fallbackHomeHero,
      aboutHeroImageUrl: mediaRaw.aboutHeroImageUrl || fallbackAboutHero,
      aboutBottomBannerImageUrl: mediaRaw.aboutBottomBannerImageUrl || fallbackAboutBottom,
    } : {
      homeHeroImageUrl: fallbackHomeHero,
      aboutHeroImageUrl: fallbackAboutHero,
      aboutBottomBannerImageUrl: fallbackAboutBottom,
    };

    // Format Challenge Winners
    let challengeWinners = { winners: [] as any[], challengeTitle: '', challengeId: '' };
    if (latestChallenge) {
      const attempts = await ChallengeAttempt.find({
        challengeId: latestChallenge._id,
        status: { $in: ['submitted', 'auto-submitted'] },
      })
        .sort({ score: -1, timeTakenSeconds: 1, submittedAt: 1 })
        .limit(3)
        .populate('userId', 'name avatarUrl')
        .lean();

      const winners = attempts.map((a: any, idx) => ({
        rank: idx + 1,
        id: a._id.toString(),
        score: a.score,
        timeTakenSeconds: a.timeTakenSeconds,
        user: {
          name: a.userId?.name || 'Anonymous User',
          avatar: a.userId?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
        },
      }));

      challengeWinners = {
        winners,
        challengeTitle: latestChallenge.title,
        challengeId: latestChallenge._id.toString(),
      };
    }

    // Format Featured Q&As
    const featuredQAs = (featuredQAsRaw || []).map((qa: any) => ({
      id: qa._id.toString(),
      name: qa.name,
      question: qa.question,
      answer: qa.answer,
      category: qa.category,
      tags: qa.tags || [],
      isFeatured: qa.isFeatured,
      publishedAt: qa.publishedAt ? qa.publishedAt.toISOString() : null,
    }));

    // Format Featured Reviews
    const featuredReviews = (featuredReviewsRaw || []).map((r: any) => ({
      id: r._id.toString(),
      name: r.name,
      avatarUrl: r.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      overallRating: r.overallRating,
      designRating: r.designRating,
      speedRating: r.speedRating,
      contentRating: r.contentRating,
      easeOfUseRating: r.easeOfUseRating,
      impressedBy: r.impressedBy || [],
      improvementSuggestions: r.improvementSuggestions || [],
      reviewText: r.reviewText,
      wouldRecommend: r.wouldRecommend,
      isFeatured: r.isFeatured,
      adminReply: r.adminReply || '',
      createdAt: r.createdAt.toISOString(),
    }));

    // Format Featured Courses
    const featuredCourses = (featuredCoursesRaw || []).map((c: any) => ({
      id: c._id.toString(),
      title: c.title,
      slug: c.slug,
      shortDescription: c.shortDescription,
      thumbnailUrl: c.thumbnailUrl,
      bannerUrl: c.bannerUrl || '',
      price: c.price,
      salePrice: c.salePrice,
      category: c.category,
      level: c.level,
    }));

    // Format Course Settings
    const defaultCourseSettings = {
      homeBannerTitle: 'Start Learning Practical Web Development',
      homeBannerSubtitle: 'Learn by building real projects with clear step-by-step lessons.',
      homeBannerImageUrl: '',
      homeBannerCtaText: 'Explore Courses',
      homeBannerCtaLink: '/courses',
      paymentInstructions: 'Please send the course amount to one of our mobile banking numbers and fill up the checkout form.',
      paymentMethods: [
        { name: 'bKash', details: 'Personal: 01700000000', status: 'active' },
        { name: 'Nagad', details: 'Personal: 01800000000', status: 'active' }
      ],
      supportContact: 'support@tarikurrahman.com',
      showCourseSectionOnHome: true,
    };
    const courseSettings = courseSettingsRaw || defaultCourseSettings;

    const responseData = {
      siteSettings: dbSettings || {},
      projects,
      blogs,
      services,
      skills,
      experiences,
      pageMedia,
      challengeWinners,
      featuredQAs,
      featuredReviews,
      featuredCourses,
      courseSettings,
    };

    // Cache for 10 minutes
    serverCache.set(cacheKey, responseData, 600000);

    return ApiResponse.success(responseData, 'All homepage data batched successfully');
  } catch (err: any) {
    console.error('All homepage data batch error:', err);
    return ApiResponse.serverError('Failed to fetch batch homepage data');
  }
}

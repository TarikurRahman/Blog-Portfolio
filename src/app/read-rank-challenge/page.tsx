import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Award, Clock, ArrowRight, AwardIcon, HelpCircle } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import ReadRankChallenge from '@/models/ReadRankChallenge';
import Blog from '@/models/Blog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Card from '@/components/Card';
import Button from '@/components/Button';

export const metadata: Metadata = {
  title: 'Read & Rank Challenges | Tarikur Rahman',
  description: "Join timed MCQ challenges, test your technical skills, and climb the leaderboard on Tarikur Rahman's developer portfolio.",
  keywords: ['timed quiz', 'developer leaderboard', 'nextjs challenge', 'MCQ challenge'],
};

async function getActiveChallenges() {
  try {
    await connectDB();
    const now = new Date();
    // Get active challenges populated with related blogs
    const challenges = await ReadRankChallenge.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ endDate: 1 })
      .populate('blogId', 'title slug')
      .lean();

    return challenges.map((c: any) => ({
      id: c._id.toString(),
      title: c.title,
      description: c.description,
      totalQuestions: c.totalQuestions,
      timeLimitMinutes: c.timeLimitMinutes,
      endDate: c.endDate.toLocaleDateString(),
      blogTitle: c.blogId?.title || null,
      blogSlug: c.blogId?.slug || null,
      resultPublished: c.resultPublished,
    }));
  } catch (err) {
    console.error('Failed to load challenges:', err);
    return [];
  }
}

export default async function ReadRankChallengeHubPage() {
  const challenges = await getActiveChallenges();

  return (
    <>
      <Navbar />
      
      <main className="min-h-[85vh] pt-32 pb-20 bg-brand-bg relative overflow-hidden">
        {/* Glow visual background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 text-center mb-12 relative z-10">
          <span className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-accent bg-brand-accent/10 border border-brand-accent/20 rounded-full mb-4 inline-block">
            Developer Hub
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Read & Rank Challenges
          </h1>
          <p className="text-xs md:text-sm text-brand-text-muted mt-3 max-w-xl mx-auto leading-relaxed">
            Read Tarikur's publication articles, understand technical stack configurations, then test your knowledge under timed conditions to claim a top spot on the scoreboard.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          {challenges.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {challenges.map((c) => (
                <Card key={c.id} hoverEffect className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="p-1 bg-brand-accent/15 rounded text-brand-accent">
                        <Award className="w-4 h-4" />
                      </span>
                      {c.blogTitle ? (
                        <span className="text-[10px] text-brand-text-muted font-bold">
                          Linked blog:{' '}
                          <Link href={`/blog/${c.blogSlug}`} className="text-brand-accent hover:underline">
                            {c.blogTitle}
                          </Link>
                        </span>
                      ) : (
                        <span className="text-[10px] text-brand-text-muted font-bold">General Challenge</span>
                      )}
                    </div>

                    <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                      {c.title}
                    </h2>
                    <p className="text-xs text-brand-text-muted mt-1 leading-relaxed max-w-xl">
                      {c.description}
                    </p>

                    {/* Meta parameter row */}
                    <div className="flex items-center gap-4 mt-4 text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-brand-accent" />
                        {c.totalQuestions} Questions
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-accent" />
                        {c.timeLimitMinutes} Mins
                      </span>
                      <span className="text-orange-400 font-extrabold">Closes: {c.endDate}</span>
                    </div>
                  </div>

                  <div className="shrink-0 w-full md:w-auto">
                    <Link href={`/read-rank-challenge/${c.id}`} className="w-full">
                      <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Join Challenge
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-brand-card border border-brand-border-white/5 rounded-3xl p-8">
              <AwardIcon className="w-12 h-12 text-brand-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">No Active Challenges</h3>
              <p className="text-xs text-brand-text-muted mt-2 max-w-sm mx-auto leading-relaxed">
                There are currently no active challenges open. Please subscribe to Tarikur's blog posts or check back later!
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
export const revalidate = 60; // cached for 1 minute

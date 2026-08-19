'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, ChevronRight, Lock, Play } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Button from '../Button';
import LoadingState from '../LoadingState';

interface BlogChallengeCTAProps {
  blogSlug: string;
}

export default function BlogChallengeCTA({ blogSlug }: BlogChallengeCTAProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [challengeData, setChallengeData] = useState<any>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch(`/api/blogs/slug/${blogSlug}/challenge`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setChallengeData(json.data);
          }
        }
      } catch (err) {
        console.error('Error fetching blog challenge:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [blogSlug, user]);

  if (loading) {
    return (
      <div className="py-6 border-t border-brand-border-white/5 flex justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-accent/30 border-t-brand-accent animate-spin" />
      </div>
    );
  }

  if (!challengeData || !challengeData.hasChallenge) {
    return null;
  }

  const { challenge, hasAttempted, attemptStatus, attemptId } = challengeData;

  return (
    <div className="mt-16 p-8 rounded-3xl bg-gradient-to-tr from-brand-card to-brand-card-light border-2 border-brand-accent/20 hover:border-brand-accent/40 transition-all duration-300 shadow-xl relative overflow-hidden text-left max-w-4xl mx-auto">
      {/* Background glow visual */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-48 h-48 bg-brand-accent/10 rounded-full blur-[45px] pointer-events-none" />

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
        <div className="flex-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-[10px] font-bold text-brand-accent uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5" />
            Read & Rank Timed MCQ Challenge
          </span>
          <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
            You finished reading. Ready to test your knowledge?
          </h3>
          <p className="text-xs text-brand-text-muted mt-2 max-w-xl leading-relaxed">
            Challenge title: <span className="text-white font-bold">{challenge.title}</span>. Answer{' '}
            {challenge.totalQuestions} questions in {challenge.timeLimitMinutes} minutes to climb the leaderboard!
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-stretch sm:items-start gap-3 w-full md:w-auto">
          {!user ? (
            <div className="flex flex-col gap-2">
              <Link href="/login">
                <Button variant="primary" size="md" rightIcon={<Play className="w-4 h-4" />}>
                  Login to Start Challenge
                </Button>
              </Link>
              <span className="text-[10px] text-brand-text-muted text-center font-medium">
                Please login or create an account to join.
              </span>
            </div>
          ) : challenge.requireVerifiedUser && !user.emailVerified ? (
            <div className="flex flex-col gap-2">
              <Button variant="primary" size="md" disabled leftIcon={<Lock className="w-4 h-4" />}>
                Start Challenge
              </Button>
              <span className="text-[10px] text-orange-400 font-bold text-center">
                Please verify your account before joining this challenge.
              </span>
            </div>
          ) : hasAttempted ? (
            attemptStatus === 'started' ? (
              <Link href={`/read-rank-challenge/${challenge.id}`} className="w-full">
                <Button variant="primary" size="md" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Resume Challenge
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href={`/read-rank-challenge/${challenge.id}`} className="w-full">
                  <Button variant="secondary" size="md" rightIcon={<CheckCircle2 className="w-4 h-4" />}>
                    View Attempt Result
                  </Button>
                </Link>
                {challenge.allowRetake && (
                  <Link href={`/read-rank-challenge/${challenge.id}`} className="w-full">
                    <Button variant="outline" size="sm">
                      Retake Challenge
                    </Button>
                  </Link>
                )}
              </div>
            )
          ) : (
            <Link href={`/read-rank-challenge/${challenge.id}`} className="w-full">
              <Button variant="primary" size="md" rightIcon={<Play className="w-4 h-4 animate-ping" />}>
                Start Challenge
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

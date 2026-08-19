'use client';

import React, { useEffect, useState } from 'react';
import { Star, Check, HelpCircle, MessageSquare } from 'lucide-react';
import Card from '../Card';

interface ReviewData {
  id: string;
  name: string;
  avatarUrl: string;
  overallRating: number;
  designRating: number;
  speedRating: number;
  contentRating: number;
  easeOfUseRating: number;
  impressedBy: string[];
  improvementSuggestions: string[];
  reviewText: string;
  wouldRecommend: boolean;
  isFeatured: boolean;
  adminReply?: string;
  createdAt: string;
}

interface FeaturedReviewsProps {
  refreshTrigger: number;
}

export default function FeaturedReviews({ refreshTrigger }: FeaturedReviewsProps) {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewData[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/site-review');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setReviews(json.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [refreshTrigger]);

  const renderStars = (count: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((val) => (
        <Star
          key={val}
          className={`w-3.5 h-3.5 ${
            val <= count ? 'text-amber-400 fill-amber-400' : 'text-brand-text-muted/30'
          }`}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left animate-pulse">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-3xl bg-brand-card/30 border border-brand-border-white/5 p-6 h-48 flex flex-col gap-4">
            <div className="flex items-center gap-3 justify-between pb-3 border-b border-brand-border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-card-dark" />
                <div className="flex flex-col gap-1.5">
                  <div className="h-3 bg-brand-card-dark rounded-full w-20" />
                  <div className="h-2 bg-brand-card-dark rounded-full w-12" />
                </div>
              </div>
              <div className="w-16 h-3 bg-brand-card-dark rounded-full" />
            </div>
            <div className="space-y-2 mt-2">
              <div className="h-3 bg-brand-card-dark rounded-full w-full" />
              <div className="h-3 bg-brand-card-dark rounded-full w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16 bg-brand-card border border-brand-border-white/5 rounded-3xl p-8 text-white">
        <HelpCircle className="w-12 h-12 text-brand-text-muted mx-auto mb-4" />
        <h3 className="text-lg font-bold">No Reviews Yet</h3>
        <p className="text-xs text-brand-text-muted mt-2 max-w-sm mx-auto leading-relaxed">
          Be the first to submit a review of your user experience! Fill out the form above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      {reviews.map((rev) => (
        <Card key={rev.id} hoverEffect className="p-6 border border-brand-accent/15 flex flex-col gap-4 relative overflow-hidden bg-brand-card">
          {/* Header */}
          <div className="flex items-center gap-3 justify-between pb-3 border-b border-brand-border-white/5">
            <div className="flex items-center gap-2.5">
              <img
                src={rev.avatarUrl}
                alt={rev.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';
                }}
                className="w-8 h-8 rounded-full object-cover border border-brand-border-white"
              />
              <div>
                <span className="text-xs font-bold text-white block leading-none">{rev.name}</span>
                <span className="text-[8px] text-brand-text-muted mt-1 block">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              {renderStars(rev.overallRating)}
              {rev.wouldRecommend && (
                <span className="inline-flex items-center gap-1 text-[8px] text-green-400 font-extrabold uppercase">
                  <Check className="w-3 h-3" /> Recommends Site
                </span>
              )}
            </div>
          </div>

          {/* Ratings list breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[8px] text-brand-text-muted font-bold uppercase p-2 bg-brand-card-dark rounded-xl border border-brand-border-white/5">
            <div>
              Design: <span className="text-white">{rev.designRating}/5</span>
            </div>
            <div>
              Speed: <span className="text-white">{rev.speedRating}/5</span>
            </div>
            <div>
              Content: <span className="text-white">{rev.contentRating}/5</span>
            </div>
            <div>
              Navigation: <span className="text-white">{rev.easeOfUseRating}/5</span>
            </div>
          </div>

          {/* Review text */}
          <p className="text-xs text-white/90 leading-relaxed italic">
            &quot;{rev.reviewText}&quot;
          </p>

          {/* Impressed choices tags */}
          {rev.impressedBy.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[8px] text-brand-text-muted font-bold uppercase tracking-wider mr-1.5">Impressed By:</span>
              {rev.impressedBy.map((imp) => (
                <span key={imp} className="px-2 py-0.5 bg-brand-accent/10 border border-brand-accent/25 rounded text-[8px] font-bold text-brand-accent uppercase">
                  {imp}
                </span>
              ))}
            </div>
          )}

          {/* Admin reply panel */}
          {rev.adminReply && (
            <div className="p-4 bg-brand-accent/5 border border-brand-accent/10 rounded-2xl flex items-start gap-2.5 mt-auto">
              <MessageSquare className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-[8px] text-brand-accent font-extrabold uppercase tracking-wider">Tarikur&apos;s Response</p>
                <p className="text-[11px] text-brand-text-muted mt-1 leading-relaxed">{rev.adminReply}</p>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Star, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Button from '../Button';

interface SiteReviewFormProps {
  onSuccess: () => void;
}

const IMPRESSED_CHOICES = ['Design', 'Animation', 'Projects', 'Blog', 'Dashboard', 'Speed', 'User experience', 'Features'];
const IMPROVE_CHOICES = ['More projects', 'More blogs', 'Faster loading', 'More animations', 'Better mobile view', 'More features'];

export default function SiteReviewForm({ onSuccess }: SiteReviewFormProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Ratings
  const [overallRating, setOverallRating] = useState(5);
  const [designRating, setDesignRating] = useState(5);
  const [speedRating, setSpeedRating] = useState(5);
  const [contentRating, setContentRating] = useState(5);
  const [easeOfUseRating, setEaseOfUseRating] = useState(5);

  const [impressedBy, setImpressedBy] = useState<string[]>([]);
  const [improvementSuggestions, setImprovementSuggestions] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleImpressed = (choice: string) => {
    setImpressedBy((prev) =>
      prev.includes(choice) ? prev.filter((c) => c !== choice) : [...prev, choice]
    );
  };

  const toggleImprove = (choice: string) => {
    setImprovementSuggestions((prev) =>
      prev.includes(choice) ? prev.filter((c) => c !== choice) : [...prev, choice]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setError('Please write a quick review note.');
      return;
    }
    if (!user && (!name.trim() || !email.trim())) {
      setError('Name and Email are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/site-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user ? user.name : name,
          email: user ? user.email : email,
          overallRating,
          designRating,
          speedRating,
          contentRating,
          easeOfUseRating,
          impressedBy,
          improvementSuggestions,
          reviewText,
          wouldRecommend,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsSubmitted(true);
        setReviewText('');
        setImpressedBy([]);
        setImprovementSuggestions([]);
        showToast('Review submitted successfully!', 'success');
        onSuccess();
      } else {
        setError(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit. Check network connections.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, setRating: (r: number) => void) => (
    <div className="flex gap-1.5 items-center">
      {[1, 2, 3, 4, 5].map((val) => (
        <button
          key={val}
          type="button"
          onClick={() => setRating(val)}
          className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              val <= rating ? 'text-amber-400 fill-amber-400' : 'text-brand-text-muted/40'
            }`}
          />
        </button>
      ))}
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="bg-brand-card border border-brand-accent/25 rounded-3xl p-6 md:p-8 text-center text-white glow-accent flex flex-col items-center">
        <CheckCircle2 className="w-12 h-12 text-brand-accent mb-4 animate-pulse" />
        <h3 className="text-lg font-bold tracking-tight mb-2">Review Submitted</h3>
        <p className="text-xs text-brand-text-muted mb-6 leading-relaxed max-w-sm">
          Thank you for grading your portfolio experience! Reviews are pending verification before publishing. We appreciate your constructive feedback.
        </p>
        <Button variant="secondary" size="sm" onClick={() => setIsSubmitted(false)}>
          Submit Another Note
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-brand-card border border-brand-accent/15 rounded-3xl p-6 md:p-8 text-left text-white">
      <h3 className="text-lg font-bold tracking-tight mb-4 border-l-3 border-brand-accent pl-3">
        Review Your Experience
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Name and email (for guests) */}
        {!user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Your Name *</label>
              <input
                type="text"
                required
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white placeholder-brand-text-muted focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Email Address *</label>
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white placeholder-brand-text-muted focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Ratings grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-brand-card-dark rounded-2xl border border-brand-border-white/5">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[9px] text-brand-text-muted font-bold uppercase">Overall Experience</span>
            {renderStars(overallRating, setOverallRating)}
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-[9px] text-brand-text-muted font-bold uppercase">Design & Aesthetics</span>
            {renderStars(designRating, setDesignRating)}
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-[9px] text-brand-text-muted font-bold uppercase">Page Loading Speed</span>
            {renderStars(speedRating, setSpeedRating)}
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-[9px] text-brand-text-muted font-bold uppercase">Content Quality</span>
            {renderStars(contentRating, setContentRating)}
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-[9px] text-brand-text-muted font-bold uppercase">Ease of Navigation</span>
            {renderStars(easeOfUseRating, setEaseOfUseRating)}
          </div>
        </div>

        {/* Checkbox columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Impressed Checklist */}
          <div>
            <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider block mb-2.5">What impressed you most?</span>
            <div className="flex flex-wrap gap-2">
              {IMPRESSED_CHOICES.map((choice) => {
                const isSelected = impressedBy.includes(choice);
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => toggleImpressed(choice)}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                      isSelected
                        ? 'bg-brand-accent border-brand-accent text-white'
                        : 'bg-brand-card-dark border-brand-border-white/5 text-brand-text-muted hover:border-brand-accent/30 hover:text-white'
                    }`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Improve Checklist */}
          <div>
            <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider block mb-2.5">What can be improved?</span>
            <div className="flex flex-wrap gap-2">
              {IMPROVE_CHOICES.map((choice) => {
                const isSelected = improvementSuggestions.includes(choice);
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => toggleImprove(choice)}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                      isSelected
                        ? 'bg-brand-accent border-brand-accent text-white'
                        : 'bg-brand-card-dark border-brand-border-white/5 text-brand-text-muted hover:border-brand-accent/30 hover:text-white'
                    }`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Review feedback text */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Written Review *</label>
          <textarea
            required
            rows={4}
            placeholder="Tell us what you liked, what you disliked, or suggest general improvements..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full px-4 py-3 text-xs bg-brand-card-dark border border-brand-border-white/5 rounded-xl text-white placeholder-brand-text-muted focus:outline-none resize-none"
          />
        </div>

        {/* Would recommend */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">Would you recommend this website?</span>
          <button
            type="button"
            onClick={() => setWouldRecommend(true)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              wouldRecommend
                ? 'bg-brand-accent border-brand-accent text-white'
                : 'bg-brand-card-dark border-brand-border-white/5 text-brand-text-muted'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setWouldRecommend(false)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              !wouldRecommend
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-brand-card-dark border-brand-border-white/5 text-brand-text-muted'
            }`}
          >
            No
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          rightIcon={<Send className="w-4 h-4" />}
          className="w-full sm:w-auto self-start"
        >
          Submit Review
        </Button>
      </form>
    </div>
  );
}

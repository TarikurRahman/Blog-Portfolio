'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SiteReviewForm from '@/components/reviews/SiteReviewForm';
import FeaturedReviews from '@/components/reviews/FeaturedReviews';

export default function SiteReviewPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[85vh] pt-32 pb-20 bg-brand-bg relative overflow-hidden">
        {/* Glowing visual indicators */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 text-center mb-12 relative z-10">
          <span className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-accent bg-brand-accent/10 border border-brand-accent/20 rounded-full mb-4 inline-block">
            Visitor Experience Hub
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Site Experience Reviews
          </h1>
          <p className="text-xs md:text-sm text-brand-text-muted mt-3 max-w-xl mx-auto leading-relaxed">
            Grade your experience visiting Tarikur Rahman's developer portal. Rate the speed, design layout, ease of navigation, and check what impressed you most!
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-6 flex flex-col gap-10 relative z-10">
          {/* Submission Form */}
          <SiteReviewForm onSuccess={handleSuccess} />

          {/* Testimonial Header divider */}
          <div className="text-left border-b border-brand-border-white/5 pb-4 mt-6">
            <h2 className="text-lg font-bold text-white tracking-tight">Approved Visitor Reviews</h2>
            <p className="text-xs text-brand-text-muted mt-0.5">Explore rated reviews verified by our site administrator.</p>
          </div>

          {/* Featured Reviews display list */}
          <FeaturedReviews refreshTrigger={refreshTrigger} />
        </div>
      </main>

      <Footer />
    </>
  );
}
export const dynamic = 'force-dynamic';

'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AskQuestionForm from '@/components/ask-nafij/AskQuestionForm';
import PublishedAnswers from '@/components/ask-nafij/PublishedAnswers';

export default function AskTarikurPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-[85vh] pt-32 pb-20 bg-brand-bg relative overflow-hidden">
        {/* Glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 text-center mb-12 relative z-10">
          <span className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-accent bg-brand-accent/10 border border-brand-accent/20 rounded-full mb-4 inline-block">
            Interactive Q&A Board
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Ask Tarikur Anything
          </h1>
          <p className="text-xs md:text-sm text-brand-text-muted mt-3 max-w-xl mx-auto leading-relaxed">
            Have queries about Next.js, web optimization, Shopify custom templating, or no-code Bubble builders? Send your question and get a verified answer.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-6 flex flex-col gap-10 relative z-10">
          {/* Question Form */}
          <AskQuestionForm onSuccess={handleSuccess} />

          {/* Separation Header */}
          <div className="text-left border-b border-brand-border-white/5 pb-4 mt-6">
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Published Q&As</h2>
            <p className="text-xs text-brand-text-muted mt-0.5">Explore answered user questions sorted by category.</p>
          </div>

          {/* Published Answers */}
          <PublishedAnswers refreshTrigger={refreshTrigger} />
        </div>
      </main>

      <Footer />
    </>
  );
}
export const dynamic = 'force-dynamic';

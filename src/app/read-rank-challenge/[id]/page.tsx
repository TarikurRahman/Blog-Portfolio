'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChallengeRunner from '@/components/challenge/ChallengeRunner';

export default function PlayChallengePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <>
      <Navbar />

      <main className="min-h-[85vh] pt-32 pb-20 bg-brand-bg relative overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center mb-8">
          <span className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-accent bg-brand-accent/10 border border-brand-accent/20 rounded-full mb-3 inline-block">
            Timed Assessment
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Read & Rank Assessment
          </h1>
        </div>

        <div className="relative z-10 px-6">
          {id ? (
            <ChallengeRunner challengeId={id} />
          ) : (
            <div className="text-white text-xs font-bold">Initializing challenge parameters...</div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

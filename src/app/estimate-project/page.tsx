import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectEstimator from '@/components/estimator/ProjectEstimator';

export const metadata: Metadata = {
  title: 'Smart Project Estimator | Tarikur Rahman',
  description: 'Answer a few quick questions about your project features, design style, and timeline, and get an instant automated project package and complexity estimate.',
  keywords: ['project estimator', 'web development cost', 'Next.js estimate', 'Shopify pricing', 'Bubble.io app estimate'],
  openGraph: {
    title: 'Smart Project Estimator | Tarikur Rahman',
    description: 'Get an instant build package, timeline, and complexity estimate for your custom web application, Shopify store, or portfolio.',
    type: 'website',
  },
};

export default function EstimateProjectPage() {
  return (
    <>
      <Navbar />
      
      <main className="min-h-[85vh] pt-32 pb-20 bg-brand-bg relative overflow-hidden">
        {/* Glow visuals */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 text-center mb-12 relative z-10">
          <span className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-accent bg-brand-accent/10 border border-brand-accent/20 rounded-full mb-4 inline-block">
            Interactive Calculator
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Estimate Your Project
          </h1>
          <p className="text-xs md:text-sm text-brand-text-muted mt-3 max-w-xl mx-auto leading-relaxed">
            Specify your size parameters, design preferences, and required features to calculate an instant build complexity score and package recomendation.
          </p>
        </div>

        <div className="relative z-10">
          <ProjectEstimator />
        </div>
      </main>

      <Footer />
    </>
  );
}
export const dynamic = 'force-dynamic';

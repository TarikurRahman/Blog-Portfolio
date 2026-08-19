'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import Card from '@/components/Card';
import LoadingState from '@/components/LoadingState';

function CourseSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || 'ORD-UNKNOWN';

  return (
    <div className="max-w-md mx-auto px-6 relative z-10 text-center">
      <Card hoverEffect={false} className="p-8 border border-brand-border-white bg-gradient-to-tr from-brand-card to-brand-card-light shadow-2xl flex flex-col items-center">
        
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>

        <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-none mb-3">
          Order Submitted!
        </h1>
        
        <p className="text-xs text-brand-text-muted leading-relaxed mb-6">
          Thank you for enrolling. Your payment review request has been logged successfully under order reference: 
          <span className="block mt-2 font-mono font-bold text-white text-[11px] bg-brand-card-dark px-3 py-1 rounded border border-brand-border-white/10">{orderNumber}</span>
        </p>

        <div className="p-4 bg-brand-card-dark/60 rounded-xl border border-brand-border-white/5 text-left text-[11px] text-brand-text-muted leading-normal mb-8 space-y-2">
          <p className="font-bold text-white flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-brand-accent" /> Next Steps:</p>
          <p>1. Our system moderator verifies your manual payment transaction details.</p>
          <p>2. Once verified (usually within 1-2 hours), the course will unlock in your student portal.</p>
          <p>3. You will receive access and can watch all videos inside the platform.</p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <Link href="/dashboard?tab=courses">
            <Button variant="primary" className="w-full font-bold py-2 text-xs flex justify-center gap-1.5">
              Go to My Courses <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" className="w-full font-bold py-2 text-xs flex justify-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Explore More Courses
            </Button>
          </Link>
        </div>

      </Card>
    </div>
  );
}

export default function CourseSuccessPage() {
  return (
    <>
      <Navbar />

      <main className="flex-grow pt-36 pb-24 min-h-screen bg-brand-bg flex items-center justify-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <Suspense fallback={<LoadingState message="Finalizing checkout details..." />}>
          <CourseSuccessContent />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

import React from 'react';

export function ProjectDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-20 animate-pulse text-left">
      {/* Title & metadata bar */}
      <div className="space-y-4 mb-8">
        <div className="h-4 bg-brand-card-dark rounded w-24" />
        <div className="h-10 bg-brand-card-dark rounded w-3/4 md:w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-brand-card-dark rounded-full w-16" />
          <div className="h-6 bg-brand-card-dark rounded-full w-20" />
          <div className="h-6 bg-brand-card-dark rounded-full w-24" />
        </div>
      </div>

      {/* Main mockup cover container */}
      <div className="aspect-video w-full rounded-3xl bg-brand-card/30 border border-brand-border-white/5 mb-12 h-[350px] md:h-[500px]" />

      {/* Grid: Left details, Right features Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-6 bg-brand-card-dark rounded w-48" />
          <div className="space-y-2">
            <div className="h-3 bg-brand-card-dark rounded w-full" />
            <div className="h-3 bg-brand-card-dark rounded w-full" />
            <div className="h-3 bg-brand-card-dark rounded w-5/6" />
          </div>
          <div className="h-[200px] rounded-2xl bg-brand-card/20 border border-brand-border-white/5" />
        </div>
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl bg-brand-card/30 border border-brand-border-white/5 space-y-4">
            <div className="h-5 bg-brand-card-dark rounded w-32" />
            <div className="space-y-3 pt-2">
              <div className="h-3 bg-brand-card-dark rounded w-full" />
              <div className="h-3 bg-brand-card-dark rounded w-full" />
              <div className="h-3 bg-brand-card-dark rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlogDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 animate-pulse text-left">
      {/* Meta category & date */}
      <div className="space-y-3 mb-6">
        <div className="h-4 bg-brand-card-dark rounded w-20" />
        <div className="h-10 bg-brand-card-dark rounded w-11/12" />
        <div className="flex gap-4">
          <div className="h-3 bg-brand-card-dark rounded w-28" />
          <div className="h-3 bg-brand-card-dark rounded w-20" />
        </div>
      </div>

      {/* Author bar */}
      <div className="flex items-center gap-3 mb-8 border-y border-brand-border-white/5 py-4">
        <div className="w-10 h-10 rounded-full bg-brand-card-dark" />
        <div className="space-y-1.5">
          <div className="h-3 bg-brand-card-dark rounded w-24" />
          <div className="h-2 bg-brand-card-dark rounded w-16" />
        </div>
      </div>

      {/* Main cover image */}
      <div className="w-full aspect-video rounded-3xl bg-brand-card/30 border border-brand-border-white/5 mb-10 h-[300px] md:h-[450px]" />

      {/* Article content block */}
      <div className="space-y-4">
        <div className="h-3.5 bg-brand-card-dark rounded w-full" />
        <div className="h-3.5 bg-brand-card-dark rounded w-full" />
        <div className="h-3.5 bg-brand-card-dark rounded w-11/12" />
        <br />
        <div className="h-3.5 bg-brand-card-dark rounded w-full" />
        <div className="h-3.5 bg-brand-card-dark rounded w-full" />
        <div className="h-3.5 bg-brand-card-dark rounded w-4/5" />
      </div>
    </div>
  );
}

export function CourseDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-20 animate-pulse text-left">
      {/* Breadcrumb & Title */}
      <div className="space-y-3 mb-8">
        <div className="h-4 bg-brand-card-dark rounded w-28" />
        <div className="h-10 bg-brand-card-dark rounded w-2/3" />
      </div>

      {/* Grid: Course overview left, CTA purchase card right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stats & Curriculum */}
        <div className="lg:col-span-8 space-y-8">
          <div className="h-48 bg-brand-card/30 border border-brand-border-white/5 rounded-3xl p-6 flex flex-col justify-between">
            <div className="h-6 bg-brand-card-dark rounded w-40" />
            <div className="grid grid-cols-3 gap-4">
              <div className="h-10 bg-brand-card-dark rounded" />
              <div className="h-10 bg-brand-card-dark rounded" />
              <div className="h-10 bg-brand-card-dark rounded" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-6 bg-brand-card-dark rounded w-32" />
            <div className="space-y-3">
              <div className="h-12 bg-brand-card/25 border border-brand-border-white/5 rounded-xl" />
              <div className="h-12 bg-brand-card/25 border border-brand-border-white/5 rounded-xl" />
              <div className="h-12 bg-brand-card/25 border border-brand-border-white/5 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Purchase Callout */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-3xl bg-brand-card/40 border border-brand-border-white/5 space-y-6">
            <div className="aspect-video w-full rounded-2xl bg-brand-card-dark" />
            <div className="h-8 bg-brand-card-dark rounded w-24" />
            <div className="h-12 bg-brand-accent/25 border border-brand-accent/20 rounded-xl" />
            <div className="space-y-2.5">
              <div className="h-3 bg-brand-card-dark rounded w-full" />
              <div className="h-3 bg-brand-card-dark rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LearnDashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-20 animate-pulse text-left">
      {/* Student Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-8 bg-brand-card-dark rounded w-64" />
          <div className="h-3 bg-brand-card-dark rounded w-48" />
        </div>
        <div className="h-10 bg-brand-card-dark rounded w-32" />
      </div>

      {/* Progress Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-5 bg-brand-card/30 border border-brand-border-white/5 rounded-2xl h-24" />
        <div className="p-5 bg-brand-card/30 border border-brand-border-white/5 rounded-2xl h-24" />
        <div className="p-5 bg-brand-card/30 border border-brand-border-white/5 rounded-2xl h-24" />
      </div>

      {/* Modules listing */}
      <div className="space-y-4">
        <div className="h-6 bg-brand-card-dark rounded w-40 mb-6" />
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="p-6 bg-brand-card/25 border border-brand-border-white/5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-brand-card-dark rounded w-48" />
              <div className="h-3 bg-brand-card-dark rounded w-16" />
            </div>
            <div className="h-2 bg-brand-card-dark rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LessonPlayerSkeleton() {
  return (
    <div className="min-h-screen pt-20 flex flex-col animate-pulse text-left">
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Player & Tab Details */}
        <div className="lg:col-span-8 p-6 space-y-6">
          {/* Back link */}
          <div className="h-4 bg-brand-card-dark rounded w-28" />

          {/* Large video container */}
          <div className="aspect-video w-full rounded-2xl bg-brand-card/35 border border-brand-border-white/5" />

          {/* Title and stats */}
          <div className="space-y-2">
            <div className="h-6 bg-brand-card-dark rounded w-2/3" />
            <div className="h-3 bg-brand-card-dark rounded w-40" />
          </div>

          {/* Content tabs list */}
          <div className="border-t border-brand-border-white/5 pt-6 space-y-3">
            <div className="flex gap-4">
              <div className="h-8 bg-brand-card-dark rounded w-24" />
              <div className="h-8 bg-brand-card-dark rounded w-24" />
            </div>
            <div className="h-3.5 bg-brand-card-dark rounded w-full" />
            <div className="h-3.5 bg-brand-card-dark rounded w-5/6" />
          </div>
        </div>

        {/* Right Column: Curriculum Playlist Sidebar */}
        <div className="lg:col-span-4 border-l border-brand-border-white/5 p-6 bg-brand-card/15">
          <div className="h-5 bg-brand-card-dark rounded w-36 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="p-3 bg-brand-card/25 border border-brand-border-white/5 rounded-xl h-14" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 pt-32 pb-20 animate-pulse text-left">
      {/* Title */}
      <div className="space-y-3 mb-8 text-center md:text-left">
        <div className="h-10 bg-brand-card-dark rounded w-3/4 md:w-1/2 mx-auto md:mx-0" />
        <div className="h-4 bg-brand-card-dark rounded w-48 mx-auto md:mx-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Checkout manual payment Billing form */}
        <div className="lg:col-span-7 p-6 md:p-8 rounded-3xl bg-brand-card/30 border border-brand-border-white/5 space-y-6">
          <div className="h-6 bg-brand-card-dark rounded w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-10 bg-brand-card-dark rounded" />
            <div className="h-10 bg-brand-card-dark rounded" />
          </div>
          <div className="h-10 bg-brand-card-dark rounded w-full" />
          <div className="h-28 bg-brand-card-dark/40 rounded-xl" />
        </div>

        {/* Right Column: Payment Details Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-brand-card/45 border border-brand-accent/15 space-y-4">
            <div className="h-5 bg-brand-card-dark rounded w-36" />
            <div className="flex justify-between">
              <div className="h-3 bg-brand-card-dark rounded w-20" />
              <div className="h-3 bg-brand-card-dark rounded w-12" />
            </div>
            <div className="h-[1px] bg-brand-border-white/5" />
            <div className="flex justify-between">
              <div className="h-4 bg-brand-card-dark rounded w-16" />
              <div className="h-4 bg-brand-card-dark rounded w-16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

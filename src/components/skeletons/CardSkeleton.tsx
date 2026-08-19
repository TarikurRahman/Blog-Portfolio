import React from 'react';

interface CardSkeletonProps {
  type?: 'card' | 'wide' | 'profile';
  count?: number;
}

export default function CardSkeleton({ type = 'card', count = 3 }: CardSkeletonProps) {
  const skeletons = Array.from({ length: count });

  if (type === 'wide') {
    return (
      <div className="flex flex-col gap-4 w-full">
        {skeletons.map((_, idx) => (
          <div
            key={idx}
            className="w-full h-24 rounded-3xl bg-brand-card border border-brand-accent/5 p-5 flex items-center justify-between animate-pulse"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 rounded-full bg-brand-card-dark" />
              <div className="flex flex-col gap-2 flex-1 max-w-md">
                <div className="h-3 bg-brand-card-dark rounded-full w-2/3" />
                <div className="h-2 bg-brand-card-dark rounded-full w-1/2" />
              </div>
            </div>
            <div className="w-16 h-8 rounded-xl bg-brand-card-dark" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="w-full flex flex-col gap-6 animate-pulse p-6 bg-brand-card border border-brand-border-white/5 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-card-dark" />
          <div className="flex flex-col gap-2">
            <div className="h-4 bg-brand-card-dark rounded-full w-32" />
            <div className="h-3 bg-brand-card-dark rounded-full w-24" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-brand-card-dark rounded-full w-full" />
          <div className="h-3 bg-brand-card-dark rounded-full w-5/6" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl bg-brand-card border border-brand-accent/5 p-6 flex flex-col gap-4 animate-pulse text-left h-48"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-card-dark" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3 bg-brand-card-dark rounded-full w-1/2" />
              <div className="h-2 bg-brand-card-dark rounded-full w-1/3" />
            </div>
          </div>
          <div className="space-y-2 mt-2">
            <div className="h-3 bg-brand-card-dark rounded-full w-full" />
            <div className="h-3 bg-brand-card-dark rounded-full w-4/5" />
          </div>
          <div className="h-8 bg-brand-card-dark rounded-xl w-24 mt-auto" />
        </div>
      ))}
    </div>
  );
}

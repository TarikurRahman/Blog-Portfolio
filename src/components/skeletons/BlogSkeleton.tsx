import React from 'react';

export const BlogSkeleton = () => {
  return (
    <div className="bg-brand-card border border-brand-border rounded-3xl overflow-hidden shadow-xl animate-pulse">
      {/* Thumbnail */}
      <div className="aspect-video bg-brand-card-dark/60 w-full" />
      
      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Category badge */}
        <div className="h-4 bg-brand-card-dark/60 w-1/4 rounded-full" />
        
        {/* Title */}
        <div className="h-6 bg-brand-card-dark/60 w-3/4 rounded-lg" />
        
        {/* Excerpt description */}
        <div className="space-y-2">
          <div className="h-3 bg-brand-card-dark/60 w-full rounded" />
          <div className="h-3 bg-brand-card-dark/60 w-5/6 rounded" />
        </div>
        
        {/* Author & Read Time metadata */}
        <div className="flex items-center justify-between pt-4 border-t border-brand-border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-card-dark/60" />
            <div className="h-3 bg-brand-card-dark/60 w-16 rounded" />
          </div>
          <div className="h-3 bg-brand-card-dark/60 w-12 rounded" />
        </div>
      </div>
    </div>
  );
};

export default BlogSkeleton;

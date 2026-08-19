'use client';

import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = 'Loading contents...' }: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 w-full text-center">
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-brand-accent/20 border-t-brand-accent animate-spin" />
        {/* Inner reverse spinner */}
        <div className="w-6 h-6 rounded-full border-4 border-brand-border-white border-b-brand-accent animate-spin [animation-direction:reverse]" />
      </div>
      <p className="text-sm font-medium text-brand-text-muted mt-5 animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingState;

'use client';

import React from 'react';
import { Archive } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  title = 'No records found',
  message = 'Try modifying your search query or filters to find what you are looking for.',
  icon,
  actionText,
  onAction
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl glass-panel border border-brand-border-white max-w-md mx-auto my-6">
      <div className="p-4 bg-brand-accent/10 border border-brand-accent/20 rounded-full text-brand-accent mb-4">
        {icon || <Archive className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-brand-text-muted mb-6 leading-relaxed">{message}</p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

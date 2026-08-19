import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export const TableSkeleton = ({ rows = 5, cols = 4 }: TableSkeletonProps) => {
  return (
    <div className="w-full bg-brand-card/10 border border-brand-border rounded-xl p-4 animate-pulse overflow-hidden">
      {/* Table Header */}
      <div className="flex gap-4 mb-4 border-b border-brand-border-white/10 pb-3">
        {Array.from({ length: cols }).map((_, idx) => (
          <div
            key={idx}
            className="h-4 bg-brand-card-dark/60 rounded-md flex-1"
          />
        ))}
      </div>

      {/* Table Rows */}
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-5 bg-brand-card-dark/40 rounded-md flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;

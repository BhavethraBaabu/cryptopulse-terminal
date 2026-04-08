import React from 'react';

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`skeleton rounded animate-pulse ${className ?? ''}`} />;
}

export default function CoinsLoading() {
  return (
    <main id="coins-page" aria-busy="true" aria-label="Loading coins">
      <div className="content">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <h4>All Coins</h4>
          <SkeletonBox className="h-10 w-64 rounded-xl" />
        </div>

        {/* Table skeleton */}
        <div className="coins-table bg-dark-500 rounded-xl overflow-hidden animate-pulse">
          {/* Table header */}
          <div className="flex items-center py-4 px-5 gap-6 bg-dark-400">
            {['w-6', 'w-20', 'w-24', 'w-20', 'w-28', 'w-24'].map((w, i) => (
              <SkeletonBox key={i} className={`h-4 ${w}`} />
            ))}
          </div>

          {/* Table rows */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center py-4 px-5 gap-6 border-b border-white/5"
            >
              <SkeletonBox className="h-4 w-6 shrink-0" />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 skeleton rounded-full shrink-0" />
                <SkeletonBox className="h-4 w-16" />
              </div>
              <SkeletonBox className="h-4 w-24 ml-auto" />
              <SkeletonBox className="h-4 w-16" />
              <SkeletonBox className="h-4 w-28" />
              <SkeletonBox className="h-4 w-20" />
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-center gap-4 mt-8 animate-pulse">
          <SkeletonBox className="h-10 w-28 rounded-xl" />
          <SkeletonBox className="h-10 w-20 rounded-xl" />
          <SkeletonBox className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </main>
  );
}

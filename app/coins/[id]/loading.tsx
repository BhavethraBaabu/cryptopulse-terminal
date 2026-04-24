import React from 'react';

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`skeleton rounded animate-pulse ${className ?? ''}`} />;
}

export default function CoinDetailLoading() {
  return (
    <main id="coin-details-page" aria-busy="true" aria-label="Loading coin details">
      {/* Primary column: chart + trade feed */}
      <section className="primary space-y-6">
        {/* Chart skeleton */}
        <div id="coin-overview-fallback" className="w-full">
          <div className="header animate-pulse">
            <div className="header-image skeleton rounded-full" />
            <div className="info">
              <SkeletonBox className="header-line-sm" />
              <SkeletonBox className="header-line-lg mt-1" />
            </div>
          </div>
          {/* Interval buttons */}
          <div className="flex gap-2 mt-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonBox key={i} className="h-8 w-12 rounded-sm" />
            ))}
          </div>
          <div className="chart mt-3">
            <SkeletonBox className="chart-skeleton" />
          </div>
        </div>

        {/* Market Statistics header */}
        <div className="mt-8 mb-6 animate-pulse">
          <SkeletonBox className="h-8 w-56" />
        </div>

        {/* Live trade feed skeleton */}
        <div className="bg-dark-500 rounded-2xl p-6 h-[400px] flex flex-col animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <SkeletonBox className="h-5 w-5 rounded" />
            <SkeletonBox className="h-5 w-36" />
          </div>
          <div className="flex-1 space-y-3 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-dark-400/50"
              >
                <div className="flex flex-col gap-1.5">
                  <SkeletonBox className="h-3.5 w-10" />
                  <SkeletonBox className="h-3 w-16" />
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  <SkeletonBox className="h-3.5 w-24" />
                  <SkeletonBox className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary column: coin card + details */}
      <section className="secondary space-y-8">
        {/* Coin card skeleton */}
        <div className="bg-dark-500 rounded-lg p-5 border border-purple-600/20 animate-pulse">
          <div className="flex items-start gap-4 mb-6">
            <SkeletonBox className="w-16 h-16 rounded-2xl" />
            <div className="flex flex-col gap-2 mt-1">
              <SkeletonBox className="h-5 w-20" />
              <SkeletonBox className="h-4 w-14" />
            </div>
          </div>
          <div className="flex justify-between items-center mb-5">
            <SkeletonBox className="h-7 w-32" />
            <SkeletonBox className="h-7 w-20 rounded-full" />
          </div>
          <div className="space-y-3 pt-4 border-t border-dark-400">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <SkeletonBox className="h-4 w-24" />
                <SkeletonBox className="h-4 w-28" />
              </div>
            ))}
          </div>
        </div>

        {/* Market details skeleton */}
        <div className="space-y-4 animate-pulse">
          <SkeletonBox className="h-7 w-40" />
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-dark-500 px-5 py-6 rounded-lg flex flex-col gap-3">
                <SkeletonBox className="h-4 w-24" />
                <SkeletonBox className="h-5 w-32" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

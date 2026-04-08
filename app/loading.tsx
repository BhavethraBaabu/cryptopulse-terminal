import React from 'react';

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`skeleton rounded animate-pulse ${className ?? ''}`} />;
}

export default function HomeLoading() {
  return (
    <main className="main-container" aria-busy="true" aria-label="Loading dashboard">
      <section className="home-grid">
        {/* Chart skeleton */}
        <div id="coin-overview-fallback" className="xl:col-span-2">
          <div className="header animate-pulse">
            <div className="header-image skeleton rounded-full" />
            <div className="info">
              <SkeletonBox className="header-line-sm" />
              <SkeletonBox className="header-line-lg mt-1" />
            </div>
          </div>
          <div className="chart mt-3">
            <SkeletonBox className="chart-skeleton" />
          </div>
        </div>

        {/* Trending coins skeleton */}
        <div id="trending-coins-fallback">
          <h4>Trending Coins</h4>
          <div className="trending-coins-table">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="search-item animate-pulse">
                <div className="coin-info col-span-2">
                  <div className="name-image skeleton rounded-full" />
                  <SkeletonBox className="name-line" />
                </div>
                <SkeletonBox className="change-line" />
                <SkeletonBox className="price-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories skeleton */}
      <section className="w-full mt-7">
        <div id="categories-fallback" className="animate-pulse">
          <h4>Top Categories</h4>
          <div className="space-y-1 mt-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4 px-5">
                <SkeletonBox className="category-skeleton" />
                <div className="flex gap-1 top-gainers-cell">
                  {[0, 1, 2].map((j) => (
                    <div key={j} className="coin-skeleton skeleton rounded-full" />
                  ))}
                </div>
                <SkeletonBox className="value-skeleton-sm ml-auto" />
                <SkeletonBox className="value-skeleton-md" />
                <SkeletonBox className="value-skeleton-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function WatchlistLoading() {
  return (
    <main className="main-container" aria-busy="true" aria-label="Loading watchlist">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2 animate-pulse">
          <div className="skeleton h-8 w-44 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
        </div>
        <div className="skeleton h-5 w-28 rounded animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="w-full bg-dark-500 rounded-xl overflow-hidden mt-2 animate-pulse">
        <div className="flex items-center gap-4 px-5 py-4 bg-dark-400">
          {['w-5', 'w-32', 'w-28', 'w-24', 'w-28', 'w-8'].map((w, i) => (
            <div key={i} className={`skeleton h-4 ${w} rounded`} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-4 border-b border-white/5">
            <div className="w-9 h-9 skeleton rounded-full" />
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-16 rounded" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
            <div className="skeleton h-4 w-28 rounded" />
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-5 w-5 rounded" />
          </div>
        ))}
      </div>
    </main>
  );
}

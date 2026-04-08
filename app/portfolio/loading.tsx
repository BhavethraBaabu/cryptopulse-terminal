export default function PortfolioLoading() {
  return (
    <main className="main-container" aria-busy="true" aria-label="Loading portfolio">
      {/* Header */}
      <div className="flex items-center gap-3 animate-pulse">
        <div className="skeleton w-7 h-7 rounded" />
        <div className="space-y-1.5">
          <div className="skeleton h-7 w-40 rounded" />
          <div className="skeleton h-4 w-52 rounded" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-dark-500 rounded-xl px-5 py-5 space-y-2 border border-white/5">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-7 w-32 rounded" />
            <div className="skeleton h-4 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Main area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="bg-dark-500 rounded-xl border border-white/5 p-5 h-72">
          <div className="skeleton h-5 w-24 rounded mb-4" />
          <div className="skeleton h-52 w-52 rounded-full mx-auto" />
        </div>
        <div className="bg-dark-500 rounded-xl border border-white/5 lg:col-span-2">
          <div className="flex justify-between px-5 py-4 border-b border-white/5">
            <div className="skeleton h-5 w-20 rounded" />
            <div className="skeleton h-8 w-16 rounded-lg" />
          </div>
          <div className="space-y-px">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="skeleton w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-4 w-16 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-4 w-24 rounded" />
                <div className="space-y-1">
                  <div className="skeleton h-4 w-20 rounded" />
                  <div className="skeleton h-3 w-14 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

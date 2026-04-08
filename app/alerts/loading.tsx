export default function AlertsLoading() {
  return (
    <main className="main-container" aria-busy="true">
      <div className="flex items-center gap-3 animate-pulse">
        <div className="skeleton w-7 h-7 rounded" />
        <div className="space-y-1.5">
          <div className="skeleton h-7 w-36 rounded" />
          <div className="skeleton h-4 w-64 rounded" />
        </div>
      </div>

      <div className="space-y-3 mt-4 animate-pulse">
        <div className="skeleton h-5 w-32 rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-dark-500 rounded-xl border border-white/5 px-5 py-4 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-16 rounded" />
              <div className="skeleton h-3 w-40 rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="skeleton h-6 w-16 rounded-full" />
              <div className="skeleton h-4 w-20 rounded" />
              <div className="skeleton h-4 w-20 rounded" />
              <div className="skeleton h-4 w-4 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

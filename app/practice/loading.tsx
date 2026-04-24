export default function PracticeLoading() {
  return (
    <main className="main-container" aria-busy="true">
      <div className="flex items-center gap-3 animate-pulse mb-6">
        <div className="skeleton w-7 h-7 rounded" />
        <div className="space-y-1.5">
          <div className="skeleton h-7 w-48 rounded" />
          <div className="skeleton h-4 w-72 rounded" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-dark-500 rounded-xl border border-white/5 p-4 space-y-2">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-6 w-28 rounded" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 animate-pulse">
        <div className="skeleton h-96 rounded-xl" />
        <div className="skeleton h-96 rounded-xl" />
      </div>
    </main>
  );
}

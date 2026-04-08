export default function InsightsLoading() {
  return (
    <main className="main-container" aria-busy="true">
      <div className="flex items-center gap-3 animate-pulse mb-6">
        <div className="skeleton w-7 h-7 rounded" />
        <div className="space-y-1.5">
          <div className="skeleton h-7 w-48 rounded" />
          <div className="skeleton h-4 w-72 rounded" />
        </div>
      </div>
      <div className="skeleton h-64 rounded-xl animate-pulse" />
    </main>
  );
}

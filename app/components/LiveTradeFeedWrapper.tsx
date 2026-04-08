'use client';

import dynamic from 'next/dynamic';

// dynamic with ssr:false must live in a Client Component
const LiveTradeFeed = dynamic(() => import('./LiveTradeFeed'), {
  ssr: false,
  loading: () => (
    <div className="bg-dark-500 rounded-2xl p-6 h-100 flex flex-col xl:h-auto animate-pulse">
      <div className="skeleton h-5 w-36 rounded mb-4" />
      <div className="flex-1 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex justify-between p-3 rounded-lg bg-dark-400/50">
            <div className="flex flex-col gap-1.5">
              <div className="skeleton h-3.5 w-10 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              <div className="skeleton h-3.5 w-24 rounded" />
              <div className="skeleton h-3 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
});

export default function LiveTradeFeedWrapper({ coinId }: { coinId: string }) {
  return <LiveTradeFeed coinId={coinId} />;
}

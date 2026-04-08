'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[HomeError]', error);
  }, [error]);

  return (
    <main
      className="main-container flex flex-col items-center justify-center min-h-[60vh] text-center gap-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-white">Something went wrong</h2>
        <p className="text-gray-400 mt-2 max-w-md">
          Failed to load market data. This may be a temporary issue with the data provider.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-[#adef37] text-black font-medium rounded-xl hover:bg-[#adef37]/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#adef37]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 bg-dark-400 text-white rounded-xl hover:bg-white/10 transition-colors border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}

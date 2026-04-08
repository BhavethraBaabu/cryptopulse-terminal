'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PortfolioError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error('[PortfolioError]', error); }, [error]);

  return (
    <main className="main-container flex flex-col items-center justify-center min-h-[60vh] text-center gap-6" role="alert">
      <p className="text-2xl font-semibold text-white">Failed to load portfolio</p>
      <p className="text-gray-400 max-w-sm">Something went wrong fetching your positions.</p>
      <div className="flex gap-3">
        <button onClick={reset} className="px-6 py-2.5 bg-[#adef37] text-black font-semibold rounded-xl hover:bg-[#adef37]/90 transition-colors">
          Try again
        </button>
        <Link href="/" className="px-6 py-2.5 bg-dark-400 text-white rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
          Go home
        </Link>
      </div>
    </main>
  );
}

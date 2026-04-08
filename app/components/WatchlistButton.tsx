'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleWatchlist } from '@/app/actions/watchlist';

interface WatchlistButtonProps {
  coinSymbol: string;
  coinName: string;
  initialIsWatched: boolean;
  /** If true, the user is signed in. If false, clicking redirects to /sign-in. */
  isSignedIn: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function WatchlistButton({
  coinSymbol,
  coinName,
  initialIsWatched,
  isSignedIn,
  size = 'sm',
}: WatchlistButtonProps) {
  const [isWatched, setIsWatched] = useState(initialIsWatched);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const iconSize = size === 'lg' ? 20 : size === 'md' ? 17 : 15;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    // Optimistic update
    setIsWatched((prev) => !prev);

    startTransition(async () => {
      const result = await toggleWatchlist(coinSymbol, coinName);
      if ('error' in result) {
        // Revert if the action failed
        setIsWatched((prev) => !prev);
        router.push('/sign-in');
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={isWatched ? `Remove ${coinName} from watchlist` : `Add ${coinName} to watchlist`}
      aria-pressed={isWatched}
      className={cn(
        'rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#adef37]/50',
        size === 'lg' ? 'p-2.5' : 'p-1.5',
        isWatched
          ? 'text-[#adef37] hover:text-[#adef37]/70'
          : 'text-gray-500 hover:text-gray-300',
        isPending && 'opacity-50 cursor-wait',
      )}
    >
      <Star
        size={iconSize}
        aria-hidden="true"
        className={cn(
          'transition-all duration-200',
          isWatched ? 'fill-[#adef37]' : 'fill-none',
        )}
      />
    </button>
  );
}

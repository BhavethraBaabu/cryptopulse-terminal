'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleWatchlist } from '@/app/actions/watchlist';
import { motion } from 'framer-motion';

interface WatchlistButtonProps {
  coinSymbol: string;
  coinName: string;
  initialIsWatched: boolean;
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
  const [animKey, setAnimKey] = useState(0);
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

    const next = !isWatched;
    setIsWatched(next);
    // Trigger burst animation only when starring (adding)
    if (next) setAnimKey((k) => k + 1);

    startTransition(async () => {
      const result = await toggleWatchlist(coinSymbol, coinName);
      if ('error' in result) {
        setIsWatched((prev) => !prev);
        router.push('/sign-in');
      }
    });
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={isPending}
      whileHover={{ scale: 1.18 }}
      whileTap={{ scale: 0.78 }}
      transition={{ type: 'spring', stiffness: 420, damping: 16 }}
      aria-label={isWatched ? `Remove ${coinName} from watchlist` : `Add ${coinName} to watchlist`}
      aria-pressed={isWatched}
      className={cn(
        'rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#adef37]/50',
        size === 'lg' ? 'p-2.5' : 'p-1.5',
        isWatched ? 'text-[#adef37]' : 'text-gray-500',
        isPending && 'opacity-50 cursor-wait',
      )}
    >
      {/* key changes when starring → re-mounts → triggers the burst keyframe */}
      <motion.div
        key={animKey}
        animate={
          animKey > 0
            ? { scale: [1, 1.75, 0.82, 1.12, 1], rotate: [0, -14, 10, -5, 0] }
            : {}
        }
        transition={{ duration: 0.42, ease: 'easeOut' }}
      >
        <Star
          size={iconSize}
          aria-hidden="true"
          className={cn(
            'transition-colors duration-200',
            isWatched ? 'fill-[#adef37]' : 'fill-none',
          )}
        />
      </motion.div>
    </motion.button>
  );
}

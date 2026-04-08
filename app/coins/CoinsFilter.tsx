'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const SORT_OPTIONS = [
  { value: 'volume_desc', label: 'Volume: High → Low' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'change_desc', label: 'Change: High → Low' },
  { value: 'change_asc', label: 'Change: Low → High' },
];

export default function CoinsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get('sort') || 'volume_desc';
  const currentFilter = searchParams.get('filter') || '';
  const [inputValue, setInputValue] = useState(currentFilter);

  // Sync input value when URL changes (e.g., browser back/forward)
  useEffect(() => {
    setInputValue(searchParams.get('filter') || '');
  }, [searchParams]);

  // Debounced URL update for search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (inputValue.trim()) {
        params.set('filter', inputValue.trim());
      } else {
        params.delete('filter');
      }
      params.set('page', '1');
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.set('page', '1');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center" role="search" aria-label="Filter and sort coins">
      {/* Search input */}
      <div className="relative flex-1 max-w-xs">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search by symbol..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          aria-label="Search coins by symbol"
          className={cn(
            'w-full pl-9 pr-8 py-2.5 bg-dark-400 border border-white/10 rounded-xl text-white',
            'placeholder:text-gray-500 text-sm focus:outline-none focus:border-[#adef37]/50 transition-colors',
            isPending && 'opacity-60',
          )}
        />
        {inputValue && (
          <button
            onClick={() => setInputValue('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sort select */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="text-gray-400 w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <select
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          aria-label="Sort coins"
          className="bg-dark-400 border border-white/10 rounded-xl text-white text-sm px-3 py-2.5 cursor-pointer focus:outline-none focus:border-[#adef37]/50 transition-colors"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-dark-500">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

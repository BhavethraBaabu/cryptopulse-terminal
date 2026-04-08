import React, { Suspense } from 'react';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import DataTable from '@/app/components/DataTable';
import CoinIcon from '@/app/components/CoinIcon';
import WatchlistButton from '@/app/components/WatchlistButton';
import CoinsFilter from './CoinsFilter';
import { getWatchlistSymbols } from '@/app/actions/watchlist';

export default async function AllCoinsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? Math.max(1, parseInt(params.page) || 1) : 1;
  const sort = typeof params.sort === 'string' ? params.sort : 'volume_desc';
  const filter = typeof params.filter === 'string' ? params.filter.toUpperCase().trim() : '';

  // Auth + watchlist check (non-blocking — both run in parallel with market fetch)
  const [{ userId }, watchedSymbols] = await Promise.all([
    auth(),
    getWatchlistSymbols(),
  ]);

  let data: any[] = [];
  let fetchError = false;

  try {
    const res = await fetch('https://api.binance.us/api/v3/ticker/24hr', { next: { revalidate: 60 } });
    const tickers = await res.json();

    if (Array.isArray(tickers)) {
      let usdtPairs = tickers.filter((t) => t.symbol.endsWith('USDT'));

      // Text filter by coin symbol
      if (filter) {
        usdtPairs = usdtPairs.filter((t) =>
          t.symbol.replace('USDT', '').includes(filter),
        );
      }

      // Sorting
      if (sort === 'volume_desc') {
        usdtPairs.sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
      } else if (sort === 'price_desc') {
        usdtPairs.sort((a, b) => parseFloat(b.lastPrice) - parseFloat(a.lastPrice));
      } else if (sort === 'price_asc') {
        usdtPairs.sort((a, b) => parseFloat(a.lastPrice) - parseFloat(b.lastPrice));
      } else if (sort === 'change_desc') {
        usdtPairs.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
      } else if (sort === 'change_asc') {
        usdtPairs.sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent));
      }

      data = usdtPairs;
    }
  } catch (err) {
    console.error('Failed to fetch markets list', err);
    fetchError = true;
  }

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginatedData = data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const columns = [
    {
      header: '#',
      headClassName: 'w-16',
      cellClassName: 'rank-cell',
      cell: (_row: any, i: number) => `#${(page - 1) * ITEMS_PER_PAGE + i + 1}`,
    },
    {
      header: 'Token',
      cellClassName: 'token-cell',
      cell: (coin: any) => {
        const symbol = coin.symbol.replace('USDT', '');
        return (
          <div className="token-info">
            <Link href={`/coins/${coin.symbol}`} className="absolute inset-0 z-10" aria-label={`View ${symbol} details`} />
            <div className="w-9 h-9 rounded-full bg-dark-400 flex items-center justify-center text-xs font-bold shadow-md border border-white/5 relative overflow-hidden shrink-0">
              <CoinIcon symbol={symbol} className="w-full h-full object-contain p-1.5 z-10" />
            </div>
            <p>{symbol}</p>
          </div>
        );
      },
    },
    {
      header: 'Price',
      cellClassName: 'price-cell',
      cell: (coin: any) =>
        `$${parseFloat(coin.lastPrice).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        })}`,
    },
    {
      header: '24h Change',
      cellClassName: 'change-cell',
      cell: (coin: any) => {
        const change = parseFloat(coin.priceChangePercent) || 0;
        const isTrendingUp = change >= 0;
        return (
          <span
            className={cn('change-value', {
              'text-green-600': isTrendingUp,
              'text-red-500': !isTrendingUp,
            })}
            aria-label={`${Math.abs(change).toFixed(2)}% ${isTrendingUp ? 'increase' : 'decrease'}`}
          >
            {isTrendingUp ? <TrendingUp size={14} aria-hidden="true" /> : <TrendingDown size={14} aria-hidden="true" />}
            {isTrendingUp ? '+' : ''}
            {change.toFixed(2)}%
          </span>
        );
      },
    },
    {
      header: 'Volume (USDT)',
      cellClassName: 'market-cap-cell',
      cell: (coin: any) =>
        `$${parseFloat(coin.quoteVolume).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    },
    {
      header: '24h High / Low',
      cellClassName: 'market-cap-cell text-xs',
      cell: (coin: any) => {
        const high = parseFloat(coin.highPrice);
        const low = parseFloat(coin.lowPrice);
        return (
          <span className="flex flex-col gap-0.5">
            <span className="text-green-500">${high.toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
            <span className="text-red-500">${low.toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
          </span>
        );
      },
    },
    {
      header: '',
      headClassName: 'w-10',
      cellClassName: 'pr-3',
      cell: (coin: any) => {
        const symbol = coin.symbol.replace('USDT', '');
        return (
          <WatchlistButton
            coinSymbol={coin.symbol}
            coinName={symbol}
            initialIsWatched={watchedSymbols.has(coin.symbol)}
            isSignedIn={!!userId}
          />
        );
      },
    },
  ];

  const hasNextPage = page < totalPages;

  return (
    <main id="coins-page" aria-label="All Coins Market">
      <div className="content">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h4>All Coins</h4>
            {data.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {filter ? (
                  <>
                    <span className="text-[#adef37]">{data.length}</span> result{data.length !== 1 ? 's' : ''} for &ldquo;{filter}&rdquo;
                  </>
                ) : (
                  <>{data.length.toLocaleString()} pairs listed</>
                )}
              </p>
            )}
          </div>
          {/* CoinsFilter uses useSearchParams – must be wrapped in Suspense */}
          <Suspense fallback={<div className="h-10 w-64 bg-dark-400 rounded-xl animate-pulse" />}>
            <CoinsFilter />
          </Suspense>
        </div>

        {/* Error state */}
        {fetchError && (
          <div role="alert" className="flex flex-col items-center py-16 text-center gap-3">
            <p className="text-red-400 text-lg font-medium">Failed to load market data</p>
            <p className="text-gray-500 text-sm">Please refresh the page to try again.</p>
          </div>
        )}

        {/* Empty filter state */}
        {!fetchError && paginatedData.length === 0 && (
          <div role="status" className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <p className="text-gray-400 text-lg">
              No coins found{filter ? ` for &ldquo;${filter}&rdquo;` : ''}.
            </p>
            {filter && (
              <Link
                href="/coins"
                className="text-[#adef37] text-sm hover:underline underline-offset-4"
              >
                Clear filter
              </Link>
            )}
          </div>
        )}

        {/* Table */}
        {!fetchError && paginatedData.length > 0 && (
          <DataTable
            tableClassName="coins-table"
            columns={columns}
            data={paginatedData}
            rowKey={(row: any) => row.symbol}
          />
        )}

        {/* Pagination */}
        {!fetchError && paginatedData.length > 0 && (
          <nav
            className="flex items-center justify-center gap-4 mt-8"
            aria-label="Pagination"
          >
            <Link
              href={`/coins?page=${Math.max(1, page - 1)}&sort=${sort}${filter ? `&filter=${encodeURIComponent(filter)}` : ''}`}
              aria-disabled={page === 1}
              aria-label="Previous page"
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium shadow-md',
                page === 1
                  ? 'opacity-30 pointer-events-none bg-dark-500 text-gray-500'
                  : 'bg-dark-400 text-white hover:bg-white/10 border border-white/10 hover:border-white/20',
              )}
            >
              <ChevronLeft size={18} aria-hidden="true" />
              Previous
            </Link>

            <span
              className="text-white font-bold bg-dark-500 px-6 py-2.5 rounded-xl border border-white/10 shadow-inner"
              aria-current="page"
              aria-label={`Page ${page} of ${totalPages || 1}`}
            >
              {page}{' '}
              <span className="text-gray-500 font-normal">/ {totalPages || 1}</span>
            </span>

            <Link
              href={`/coins?page=${page + 1}&sort=${sort}${filter ? `&filter=${encodeURIComponent(filter)}` : ''}`}
              aria-disabled={!hasNextPage}
              aria-label="Next page"
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium shadow-lg border border-[#adef37]/20',
                !hasNextPage
                  ? 'opacity-30 pointer-events-none bg-dark-500 text-gray-500 border-none'
                  : 'bg-[#adef37] text-black hover:bg-[#adef37]/90 hover:scale-105',
              )}
            >
              Next
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
          </nav>
        )}
      </div>
    </main>
  );
}

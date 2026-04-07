import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import DataTable from '@/app/components/DataTable';
import CoinIcon from '@/app/components/CoinIcon';

export default async function AllCoinsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const sort = typeof params.sort === 'string' ? params.sort : 'volume_desc';

  let data: any[] = [];
  try {
    const res = await fetch('https://api.binance.us/api/v3/ticker/24hr', { next: { revalidate: 60 } });
    const tickers = await res.json();
    
    if (Array.isArray(tickers)) {
      // Filter USDT pairs
      const usdtPairs = tickers.filter(t => t.symbol.endsWith('USDT'));
      
      // Sort conditionally
      if (sort === 'volume_desc') {
        usdtPairs.sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
      } else if (sort === 'price_desc') {
        usdtPairs.sort((a, b) => parseFloat(b.lastPrice) - parseFloat(a.lastPrice));
      }
      
      data = usdtPairs;
    }
  } catch (err) {
    console.error("Failed to fetch markets list", err);
  }

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginatedData = data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const columns = [
    {
      header: 'Rank',
      cellClassName: 'rank-cell',
      cell: (row: any, i: number) => `#${(page - 1) * ITEMS_PER_PAGE + i + 1}`,
    },
    {
      header: 'Token',
      cellClassName: 'token-cell',
      cell: (coin: any) => {
        const symbol = coin.symbol.replace('USDT', '');
        return (
          <div className="token-info">
            <Link href={`/coins/${coin.symbol}`} className="absolute inset-0 z-10" aria-label="View coin" />
            <div className="w-9 h-9 rounded-full bg-dark-400 flex items-center justify-center text-xs font-bold shadow-md border border-white/5 relative overflow-hidden flex-shrink-0">
               <CoinIcon symbol={symbol} className="w-full h-full object-contain p-1.5 z-10" />
            </div>
            <p>
              {symbol} ({symbol})
            </p>
          </div>
        )
      },
    },
    {
      header: 'Price',
      cellClassName: 'price-cell',
      cell: (coin: any) => `$${parseFloat(coin.lastPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
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
          >
            {isTrendingUp && '+'}
            {Math.abs(change).toFixed(2)}%
          </span>
        );
      },
    },
    {
      header: 'Volume (USDT)',
      cellClassName: 'market-cap-cell',
      cell: (coin: any) => `$${parseFloat(coin.quoteVolume).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    },
  ];

  const hasNextPage = page < totalPages;

  return (
    <main id="coins-page">
      <div className="content">
        <h4>All Coins</h4>

        <DataTable
          tableClassName="coins-table"
          columns={columns}
          data={paginatedData}
          rowKey={(row: any) => row.symbol}
        />

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            href={`/coins?page=${Math.max(1, page - 1)}&sort=${sort}`}
            className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium shadow-md", page === 1 ? "opacity-30 pointer-events-none bg-dark-500 text-gray-500" : "bg-dark-400 text-white hover:bg-white/10 border border-white/10 hover:border-white/20")}
          >
            <ChevronLeft size={18} />
            Previous
          </Link>
          <span className="text-white font-bold bg-dark-500 px-6 py-2.5 rounded-xl border border-white/10 shadow-inner">
            {page} <span className="text-gray-500 font-normal">/ {totalPages || 1}</span>
          </span>
          <Link
            href={`/coins?page=${page + 1}&sort=${sort}`}
            className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 font-medium shadow-lg border border-[#adef37]/20", !hasNextPage ? "opacity-30 pointer-events-none bg-dark-500 text-gray-500 border-none" : "bg-[#adef37] text-black hover:bg-[#adef37]/90 hover:scale-105")}
          >
            Next
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </main>
  );
}

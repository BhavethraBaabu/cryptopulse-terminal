import React from 'react';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { TrendingUp, TrendingDown, Star, ArrowRight } from 'lucide-react';
import { getWatchlist } from '@/app/actions/watchlist';
import CoinIcon from '@/app/components/CoinIcon';
import WatchlistButton from '@/app/components/WatchlistButton';
import { cn } from '@/lib/utils';

export default async function WatchlistPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const watchlist = await getWatchlist();

  // Batch-fetch live prices for all watched coins in one request
  type TickerMap = Record<string, any>;
  let tickerMap: TickerMap = {};

  if (watchlist.length > 0) {
    try {
      const symbols = JSON.stringify(watchlist.map((w) => w.coinSymbol));
      const res = await fetch(
        `https://api.binance.us/api/v3/ticker/24hr?symbols=${symbols}`,
        { next: { revalidate: 30 } },
      );
      if (res.ok) {
        const tickers = await res.json();
        if (Array.isArray(tickers)) {
          tickerMap = Object.fromEntries(tickers.map((t: any) => [t.symbol, t]));
        }
      }
    } catch {}
  }

  const coins = watchlist.map((w) => ({ ...w, ticker: tickerMap[w.coinSymbol] ?? null }));

  // Summary stats
  const gainers = coins.filter((c) => parseFloat(c.ticker?.priceChangePercent ?? '0') >= 0).length;
  const losers = coins.length - gainers;

  return (
    <main className="main-container" aria-label="Your watchlist">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
            <Star className="text-[#adef37] fill-[#adef37]" size={26} aria-hidden="true" />
            My Watchlist
          </h2>
          {coins.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {coins.length} coin{coins.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
              <span className="text-green-500">{gainers} up</span>&nbsp;·&nbsp;
              <span className="text-red-400">{losers} down</span>
            </p>
          )}
        </div>
        <Link
          href="/coins"
          className="flex items-center gap-2 text-sm font-medium text-[#adef37] hover:text-[#adef37]/80 transition-colors"
        >
          Browse markets <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {/* Empty state */}
      {coins.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
          <div className="w-16 h-16 rounded-full bg-dark-400 flex items-center justify-center">
            <Star className="text-gray-600" size={28} />
          </div>
          <div>
            <p className="text-lg font-medium text-white">Your watchlist is empty</p>
            <p className="text-gray-400 text-sm mt-1">
              Star any coin from the markets page to track it here.
            </p>
          </div>
          <Link
            href="/coins"
            className="px-6 py-2.5 bg-[#adef37] text-black font-semibold rounded-xl hover:bg-[#adef37]/90 transition-colors"
          >
            Explore Markets
          </Link>
        </div>
      )}

      {/* Watchlist table */}
      {coins.length > 0 && (
        <div className="w-full bg-dark-500 rounded-xl overflow-hidden mt-2">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-4 bg-dark-400 text-purple-100 text-sm font-medium">
            <span className="w-5" />
            <span>Coin</span>
            <span className="text-right w-28">Price</span>
            <span className="text-right w-24">24h Change</span>
            <span className="text-right w-28 max-sm:hidden">Volume</span>
            <span className="w-8" />
          </div>

          {/* Rows */}
          {coins.map((coin) => {
            const t = coin.ticker;
            const price = t ? parseFloat(t.lastPrice) : null;
            const change = t ? parseFloat(t.priceChangePercent) : null;
            const volume = t ? parseFloat(t.quoteVolume) : null;
            const isUp = (change ?? 0) >= 0;
            const symbol = coin.coinSymbol.replace('USDT', '');

            return (
              <div
                key={coin.coinSymbol}
                className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-4 border-b border-white/5 hover:bg-dark-400/30 transition-colors relative"
              >
                {/* Full-row link */}
                <Link
                  href={`/coins/${coin.coinSymbol}`}
                  className="absolute inset-0 z-0"
                  aria-label={`View ${coin.coinName || symbol} details`}
                />

                {/* Icon */}
                <div className="w-9 h-9 rounded-full bg-dark-400 border border-white/5 flex items-center justify-center overflow-hidden relative z-10 shrink-0">
                  <CoinIcon symbol={symbol} className="w-full h-full object-contain p-1.5" />
                </div>

                {/* Name */}
                <div className="flex flex-col relative z-10">
                  <span className="font-semibold text-white">{symbol}</span>
                  <span className="text-xs text-gray-500">{coin.coinSymbol}</span>
                </div>

                {/* Price */}
                <div className="text-right font-medium relative z-10 w-28">
                  {price !== null
                    ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
                    : <span className="text-gray-600">—</span>}
                </div>

                {/* 24h change */}
                <div className="text-right w-24 relative z-10">
                  {change !== null ? (
                    <span className={cn('flex items-center justify-end gap-1 font-medium text-sm', isUp ? 'text-green-500' : 'text-red-400')}>
                      {isUp ? <TrendingUp size={13} aria-hidden="true" /> : <TrendingDown size={13} aria-hidden="true" />}
                      {isUp ? '+' : ''}{change.toFixed(2)}%
                    </span>
                  ) : <span className="text-gray-600">—</span>}
                </div>

                {/* Volume */}
                <div className="text-right w-28 text-sm text-gray-400 max-sm:hidden relative z-10">
                  {volume !== null
                    ? `$${(volume / 1e6).toFixed(1)}M`
                    : '—'}
                </div>

                {/* Star (remove) */}
                <div className="relative z-10">
                  <WatchlistButton
                    coinSymbol={coin.coinSymbol}
                    coinName={coin.coinName}
                    initialIsWatched={true}
                    isSignedIn={true}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { getPositions } from '@/app/actions/portfolio';
import PortfolioClient from './PortfolioClient';

export default async function PortfolioPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const positions = await getPositions();

  // Batch-fetch live prices and 24h changes for all held coins in one Binance request
  type TickerData = { price: number; change24h: number };
  type TickerMap = Record<string, TickerData>;
  let priceMap: TickerMap = {};

  if (positions.length > 0) {
    try {
      const symbols = JSON.stringify([...new Set(positions.map((p) => p.coinSymbol))]);
      const res = await fetch(
        `https://api.binance.us/api/v3/ticker/24hr?symbols=${symbols}`,
        { next: { revalidate: 30 } },
      );
      if (res.ok) {
        const tickers = await res.json();
        if (Array.isArray(tickers)) {
          priceMap = Object.fromEntries(
            tickers.map((t: { symbol: string; lastPrice: string; priceChangePercent: string }) => [
              t.symbol,
              { price: parseFloat(t.lastPrice), change24h: parseFloat(t.priceChangePercent) },
            ]),
          );
        }
      }
    } catch {}
  }

  // Merge positions with live prices
  const enriched = positions.map((p) => ({
    ...p,
    currentPrice: priceMap[p.coinSymbol]?.price ?? null,
    change24h: priceMap[p.coinSymbol]?.change24h ?? null,
  }));

  return (
    <main className="main-container" aria-label="Portfolio tracker">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Wallet className="text-[#adef37]" size={26} aria-hidden="true" />
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">My Portfolio</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track your real holdings and P&amp;L</p>
        </div>
      </div>

      {/* Interactive section */}
      <PortfolioClient positions={enriched} />
    </main>
  );
}

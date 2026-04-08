import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { BarChart2 } from 'lucide-react';
import { getWallet } from '@/app/actions/practice';
import PracticeClient from './PracticeClient';

// Popular coins available for paper trading
export const TRADEABLE_COINS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'SOLUSDT', name: 'Solana' },
  { symbol: 'BNBUSDT', name: 'BNB' },
  { symbol: 'XRPUSDT', name: 'XRP' },
  { symbol: 'ADAUSDT', name: 'Cardano' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin' },
  { symbol: 'AVAXUSDT', name: 'Avalanche' },
  { symbol: 'DOTUSDT', name: 'Polkadot' },
  { symbol: 'MATICUSDT', name: 'Polygon' },
];

export default async function PracticePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Fetch wallet + live prices in parallel
  const symbols = TRADEABLE_COINS.map((c) => c.symbol);

  const [wallet, priceRes] = await Promise.all([
    getWallet(),
    fetch(
      `https://api.binance.us/api/v3/ticker/price?symbols=${JSON.stringify(symbols)}`,
      { cache: 'no-store' },
    ).then((r) => (r.ok ? r.json() : [])).catch(() => []),
  ]);

  const priceMap: Record<string, number> = {};
  if (Array.isArray(priceRes)) {
    for (const { symbol, price } of priceRes) {
      priceMap[symbol] = parseFloat(price);
    }
  }

  // Enrich positions with current prices
  const enrichedPositions = wallet.positions.map((p) => ({
    ...p,
    currentPrice: priceMap[p.coinSymbol] ?? null,
    unrealisedPnl: priceMap[p.coinSymbol]
      ? (priceMap[p.coinSymbol] - p.avgEntryPrice) * p.quantity
      : null,
    pnlPct: priceMap[p.coinSymbol]
      ? ((priceMap[p.coinSymbol] - p.avgEntryPrice) / p.avgEntryPrice) * 100
      : null,
  }));

  const portfolioValue = enrichedPositions.reduce(
    (sum, p) => sum + (p.currentPrice ?? p.avgEntryPrice) * p.quantity,
    0,
  );
  const totalEquity = wallet.balance + portfolioValue;
  const totalPnl = totalEquity - wallet.startingBalance;
  const totalPnlPct = (totalPnl / wallet.startingBalance) * 100;

  return (
    <main className="main-container" aria-label="Paper trading practice">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <BarChart2 className="text-[#adef37]" size={26} aria-hidden="true" />
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Practice Trading</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Trade with $100,000 virtual USDT — no real money at risk
            </p>
          </div>
        </div>
      </div>

      <PracticeClient
        wallet={{
          id: wallet.id,
          balance: wallet.balance,
          startingBalance: wallet.startingBalance,
          resetCount: wallet.resetCount,
        }}
        positions={enrichedPositions}
        trades={wallet.trades}
        priceMap={priceMap}
        coins={TRADEABLE_COINS}
        totalEquity={totalEquity}
        totalPnl={totalPnl}
        totalPnlPct={totalPnlPct}
        portfolioValue={portfolioValue}
      />
    </main>
  );
}

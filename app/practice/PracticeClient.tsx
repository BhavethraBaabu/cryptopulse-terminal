'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { executeTrade, resetWallet } from '@/app/actions/practice';
import { cn } from '@/lib/utils';

type WalletSummary = {
  id: string;
  balance: number;
  startingBalance: number;
  resetCount: number;
};

type Position = {
  id: string;
  coinSymbol: string;
  coinName: string;
  quantity: number;
  avgEntryPrice: number;
  currentPrice: number | null;
  unrealisedPnl: number | null;
  pnlPct: number | null;
};

type Trade = {
  id: string;
  coinSymbol: string;
  coinName: string;
  side: 'buy' | 'sell' | string;
  quantity: number;
  executedPrice: number;
  fee: number;
  total: number;
  timestamp: Date | string;
};

type TradeableCoin = {
  symbol: string;
  name: string;
};

interface PracticeClientProps {
  wallet: WalletSummary;
  positions: Position[];
  trades: Trade[];
  priceMap: Record<string, number>;
  coins: TradeableCoin[];
  totalEquity: number;
  totalPnl: number;
  totalPnlPct: number;
  portfolioValue: number;
}

function formatMoney(value: number, digits = 2) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

export default function PracticeClient({
  wallet,
  positions,
  trades,
  priceMap,
  coins,
  totalEquity,
  totalPnl,
  totalPnlPct,
  portfolioValue,
}: PracticeClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [coinSymbol, setCoinSymbol] = useState(coins[0]?.symbol ?? 'BTCUSDT');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCoin = useMemo(
    () => coins.find((c) => c.symbol === coinSymbol) ?? { symbol: coinSymbol, name: coinSymbol },
    [coinSymbol, coins],
  );
  const currentPrice = priceMap[coinSymbol] ?? null;

  const handleTrade = () => {
    setMessage(null);
    setError(null);

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Enter a valid quantity greater than 0.');
      return;
    }
    if (!currentPrice || currentPrice <= 0) {
      setError('Live price unavailable for selected coin. Try again in a moment.');
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set('coinSymbol', coinSymbol);
        formData.set('coinName', selectedCoin.name);
        formData.set('side', side);
        formData.set('quantity', String(qty));
        formData.set('executedPrice', String(currentPrice));

        await executeTrade(formData);
        setQuantity('');
        setMessage(`${side === 'buy' ? 'Buy' : 'Sell'} order executed successfully.`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Trade failed. Please try again.');
      }
    });
  };

  const handleReset = () => {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        await resetWallet();
        setMessage('Practice wallet reset to $100,000.');
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to reset wallet right now.');
      }
    });
  };

  return (
    <div className="space-y-6 mt-4">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-500 rounded-xl border border-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Cash Balance</p>
          <p className="text-lg font-semibold mt-1">{formatMoney(wallet.balance)}</p>
        </div>
        <div className="bg-dark-500 rounded-xl border border-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Portfolio Value</p>
          <p className="text-lg font-semibold mt-1">{formatMoney(portfolioValue)}</p>
        </div>
        <div className="bg-dark-500 rounded-xl border border-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Total Equity</p>
          <p className="text-lg font-semibold mt-1">{formatMoney(totalEquity)}</p>
        </div>
        <div className="bg-dark-500 rounded-xl border border-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">P/L</p>
          <p className={cn('text-lg font-semibold mt-1', totalPnl >= 0 ? 'text-green-500' : 'text-red-400')}>
            {totalPnl >= 0 ? '+' : ''}{formatMoney(totalPnl)} ({totalPnl >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%)
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-dark-500 rounded-xl border border-white/5 p-4 md:p-5 space-y-3">
          <h3 className="text-lg font-semibold">Open Positions</h3>
          {positions.length === 0 ? (
            <p className="text-sm text-gray-400">No open positions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="text-left py-2 pr-2">Coin</th>
                    <th className="text-right py-2 px-2">Qty</th>
                    <th className="text-right py-2 px-2">Avg</th>
                    <th className="text-right py-2 px-2">Now</th>
                    <th className="text-right py-2 pl-2">Unrealized</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p) => (
                    <tr key={p.id} className="border-b border-white/5">
                      <td className="py-3 pr-2 font-medium">{p.coinSymbol.replace('USDT', '')}</td>
                      <td className="py-3 px-2 text-right">{p.quantity.toFixed(6)}</td>
                      <td className="py-3 px-2 text-right">{formatMoney(p.avgEntryPrice, 4)}</td>
                      <td className="py-3 px-2 text-right">
                        {p.currentPrice !== null ? formatMoney(p.currentPrice, 4) : '—'}
                      </td>
                      <td className={cn('py-3 pl-2 text-right font-medium', (p.unrealisedPnl ?? 0) >= 0 ? 'text-green-500' : 'text-red-400')}>
                        {p.unrealisedPnl !== null
                          ? `${p.unrealisedPnl >= 0 ? '+' : ''}${formatMoney(p.unrealisedPnl, 2)} (${p.pnlPct?.toFixed(2)}%)`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="bg-dark-500 rounded-xl border border-white/5 p-4 md:p-5 space-y-4">
          <h3 className="text-lg font-semibold">Place Order</h3>

          <div className="space-y-1">
            <label htmlFor="coin" className="text-xs uppercase tracking-wide text-gray-400">Coin</label>
            <select
              id="coin"
              className="w-full bg-dark-400 border border-white/10 rounded-lg px-3 py-2 text-sm"
              value={coinSymbol}
              onChange={(e) => setCoinSymbol(e.target.value)}
              disabled={pending}
            >
              {coins.map((coin) => (
                <option key={coin.symbol} value={coin.symbol}>
                  {coin.name} ({coin.symbol.replace('USDT', '')})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSide('buy')}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium border transition-colors flex items-center justify-center gap-2',
                side === 'buy'
                  ? 'bg-green-500/15 text-green-400 border-green-500/40'
                  : 'bg-dark-400 border-white/10 hover:border-white/30',
              )}
              disabled={pending}
            >
              <ArrowDownCircle size={14} /> Buy
            </button>
            <button
              type="button"
              onClick={() => setSide('sell')}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium border transition-colors flex items-center justify-center gap-2',
                side === 'sell'
                  ? 'bg-red-500/15 text-red-400 border-red-500/40'
                  : 'bg-dark-400 border-white/10 hover:border-white/30',
              )}
              disabled={pending}
            >
              <ArrowUpCircle size={14} /> Sell
            </button>
          </div>

          <div className="space-y-1">
            <label htmlFor="qty" className="text-xs uppercase tracking-wide text-gray-400">Quantity</label>
            <input
              id="qty"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="0.01"
              className="w-full bg-dark-400 border border-white/10 rounded-lg px-3 py-2 text-sm"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={pending}
            />
          </div>

          <div className="rounded-lg bg-dark-400 border border-white/10 px-3 py-2 text-sm text-gray-300">
            <p>
              Price:{' '}
              <span className="font-medium text-white">
                {currentPrice !== null ? formatMoney(currentPrice, 4) : 'Unavailable'}
              </span>
            </p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-green-500">{message}</p>}

          <button
            type="button"
            onClick={handleTrade}
            disabled={pending}
            className="w-full bg-[#adef37] text-black font-semibold rounded-lg px-4 py-2.5 hover:bg-[#adef37]/90 disabled:opacity-60"
          >
            {pending ? 'Processing...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${selectedCoin.symbol.replace('USDT', '')}`}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={pending}
            className="w-full border border-white/15 rounded-lg px-4 py-2.5 text-sm hover:bg-white/5 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Reset Wallet ({wallet.resetCount})
          </button>
        </aside>
      </section>

      <section className="bg-dark-500 rounded-xl border border-white/5 p-4 md:p-5">
        <h3 className="text-lg font-semibold mb-2">Recent Trades</h3>
        {trades.length === 0 ? (
          <p className="text-sm text-gray-400">No trades yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="text-left py-2 pr-2">Time</th>
                  <th className="text-left py-2 px-2">Coin</th>
                  <th className="text-right py-2 px-2">Side</th>
                  <th className="text-right py-2 px-2">Qty</th>
                  <th className="text-right py-2 px-2">Price</th>
                  <th className="text-right py-2 px-2">Fee</th>
                  <th className="text-right py-2 pl-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => {
                  const ts = new Date(t.timestamp);
                  return (
                    <tr key={t.id} className="border-b border-white/5">
                      <td className="py-3 pr-2 text-gray-300">
                        {Number.isNaN(ts.getTime()) ? '—' : ts.toLocaleString()}
                      </td>
                      <td className="py-3 px-2">{t.coinSymbol.replace('USDT', '')}</td>
                      <td className={cn('py-3 px-2 text-right uppercase font-medium', t.side === 'buy' ? 'text-green-500' : 'text-red-400')}>
                        {t.side}
                      </td>
                      <td className="py-3 px-2 text-right">{t.quantity.toFixed(6)}</td>
                      <td className="py-3 px-2 text-right">{formatMoney(t.executedPrice, 4)}</td>
                      <td className="py-3 px-2 text-right">{formatMoney(t.fee, 4)}</td>
                      <td className="py-3 pl-2 text-right font-medium">{formatMoney(t.total, 2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
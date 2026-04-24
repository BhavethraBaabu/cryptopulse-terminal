'use client';

import { useRef, useState, useTransition } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { executeTrade } from '@/app/actions/practice';

interface Props {
  coin: { symbol: string; name: string };
  currentPrice: number;
  balance: number;
  position: { quantity: number; avgEntryPrice: number } | null;
  onClose: () => void;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

export default function TradeModal({ coin, currentPrice, balance, position, onClose }: Props) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [qty, setQty] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const quantity = parseFloat(qty) || 0;
  const gross = quantity * currentPrice;
  const fee = gross * 0.001;
  const total = side === 'buy' ? gross + fee : gross - fee;
  const maxBuy = balance / (currentPrice * 1.001);
  const maxSell = position?.quantity ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (quantity <= 0) return setError('Enter a valid quantity.');
    if (side === 'buy' && total > balance) return setError('Insufficient balance.');
    if (side === 'sell' && quantity > maxSell) return setError('Insufficient position.');

    const fd = new FormData(formRef.current!);
    fd.set('executedPrice', String(currentPrice));

    startTransition(async () => {
      try {
        await executeTrade(fd);
        onClose();
      } catch (err: any) {
        setError(err.message ?? 'Trade failed.');
      }
    });
  };

  const setPercent = (pct: number) => {
    const max = side === 'buy' ? maxBuy : maxSell;
    setQty(((max * pct) / 100).toFixed(6));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Trade ${coin.name}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-dark-400 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{coin.symbol.replace('USDT', '')}/USDT</p>
            <p className="font-semibold text-white">{coin.name}</p>
          </div>
          <div className="text-right mr-4">
            <p className="text-xs text-gray-400">Live Price</p>
            <p className="font-semibold text-white">${fmt(currentPrice)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5">
          <input type="hidden" name="coinSymbol" value={coin.symbol} />
          <input type="hidden" name="coinName" value={coin.name} />
          <input type="hidden" name="side" value={side} />

          {/* Buy / Sell toggle */}
          <div className="grid grid-cols-2 gap-2 bg-dark-500 p-1 rounded-xl">
            {(['buy', 'sell'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setSide(s); setQty(''); setError(''); }}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all',
                  side === s
                    ? s === 'buy'
                      ? 'bg-green-500 text-white shadow'
                      : 'bg-red-500 text-white shadow'
                    : 'text-gray-400 hover:text-white',
                )}
              >
                {s === 'buy' ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                {s === 'buy' ? 'Buy' : 'Sell'}
              </button>
            ))}
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">
              Quantity ({coin.symbol.replace('USDT', '')})
            </label>
            <input
              type="number"
              name="quantity"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0.00"
              step="any"
              min="0"
              className="w-full bg-dark-500 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#adef37]/50 text-sm"
            />

            {/* Quick pct buttons */}
            <div className="flex gap-2 mt-2">
              {[25, 50, 75, 100].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPercent(p)}
                  className="flex-1 text-xs py-1 rounded-lg bg-dark-500 text-gray-400 hover:text-white hover:bg-dark-300 transition-colors border border-white/5"
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-dark-500 rounded-xl p-4 space-y-2 text-sm border border-white/5">
            <div className="flex justify-between text-gray-400">
              <span>Price</span>
              <span className="text-white">${fmt(currentPrice)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Gross</span>
              <span className="text-white">${fmt(gross)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Fee (0.1%)</span>
              <span className="text-white">${fmt(fee)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-white/10 pt-2 mt-1">
              <span className="text-gray-300">{side === 'buy' ? 'Total Cost' : 'You Receive'}</span>
              <span className={side === 'buy' ? 'text-red-400' : 'text-green-400'}>${fmt(total)}</span>
            </div>
          </div>

          {/* Available */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Available balance</span>
            <span>${fmt(balance)}</span>
          </div>
          {position && (
            <div className="flex justify-between text-xs text-gray-500 -mt-3">
              <span>Your position</span>
              <span>{position.quantity.toFixed(6)} {coin.symbol.replace('USDT', '')}</span>
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={isPending || quantity <= 0}
            className={cn(
              'w-full py-3 rounded-xl font-semibold text-sm transition-all',
              side === 'buy'
                ? 'bg-green-500 hover:bg-green-400 text-white disabled:bg-green-900 disabled:text-green-700'
                : 'bg-red-500 hover:bg-red-400 text-white disabled:bg-red-900 disabled:text-red-700',
            )}
          >
            {isPending ? 'Executing…' : `${side === 'buy' ? 'Buy' : 'Sell'} ${coin.symbol.replace('USDT', '')}`}
          </button>
        </form>
      </div>
    </div>
  );
}

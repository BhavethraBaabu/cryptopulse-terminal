'use client';

import { useState, useTransition } from 'react';
import { Bell, BellOff, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createAlert } from '@/app/actions/alerts';

interface AddAlertFormProps {
  coinSymbol: string;   // e.g. "BTCUSDT"
  coinName: string;
  currentPrice: number;
  isSignedIn: boolean;
}

export default function AddAlertForm({
  coinSymbol,
  coinName,
  currentPrice,
  isSignedIn,
}: AddAlertFormProps) {
  const [open, setOpen] = useState(false);
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState(currentPrice.toFixed(2));
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isSignedIn) { router.push('/sign-in'); return; }

    const price = parseFloat(targetPrice);
    if (!price || price <= 0) { setError('Enter a valid price.'); return; }

    startTransition(async () => {
      try {
        await createAlert(coinSymbol, coinName, condition, price);
        setSuccess(true);
        setTimeout(() => { setSuccess(false); setOpen(false); }, 1800);
      } catch {
        setError('Failed to create alert. Try again.');
      }
    });
  };

  return (
    <div className="bg-dark-500 rounded-xl border border-white/5 overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors"
        aria-expanded={open}
        aria-label="Set price alert"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <Bell size={16} className="text-[#adef37]" aria-hidden="true" />
          Set Price Alert
        </span>
        {open
          ? <ChevronUp size={16} className="text-gray-400" aria-hidden="true" />
          : <ChevronDown size={16} className="text-gray-400" aria-hidden="true" />}
      </button>

      {/* Form */}
      {open && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
          {/* Condition toggle */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium">Notify me when price is</label>
            <div className="grid grid-cols-2 gap-2">
              {(['above', 'below'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={cn(
                    'py-2 rounded-lg text-sm font-semibold capitalize transition-colors border',
                    condition === c
                      ? c === 'above'
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'bg-dark-400 border-white/10 text-gray-400 hover:text-white',
                  )}
                >
                  {c === 'above' ? '↑ Above' : '↓ Below'}
                </button>
              ))}
            </div>
          </div>

          {/* Target price */}
          <div className="space-y-1.5">
            <label htmlFor="alertPrice" className="text-xs text-gray-400 font-medium">
              Target Price (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                id="alertPrice"
                type="number"
                step="any"
                min="0"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full pl-7 pr-4 py-2.5 bg-dark-400 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#adef37]/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Target price in USD"
              />
            </div>
            <p className="text-xs text-gray-500">
              Current: ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </p>
          </div>

          {error && <p className="text-xs text-red-400" role="alert">{error}</p>}

          {success ? (
            <div className="flex items-center gap-2 text-green-500 text-sm font-medium py-1" role="status">
              <Bell size={15} className="fill-green-500" />
              Alert set!
            </div>
          ) : (
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                'w-full py-2.5 rounded-xl text-sm font-semibold transition-colors',
                isPending
                  ? 'bg-dark-400 text-gray-500 cursor-wait'
                  : 'bg-[#adef37] text-black hover:bg-[#adef37]/90',
              )}
            >
              {isPending ? 'Setting alert…' : isSignedIn ? 'Set Alert' : 'Sign in to set alert'}
            </button>
          )}
        </form>
      )}
    </div>
  );
}

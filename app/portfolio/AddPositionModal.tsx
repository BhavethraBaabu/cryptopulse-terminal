'use client';

import { useState, useTransition, useRef } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addPosition, type AddPositionInput } from '@/app/actions/portfolio';

interface AddPositionModalProps {
  onClose: () => void;
}

const POPULAR = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'SOLUSDT', name: 'Solana' },
  { symbol: 'BNBUSDT', name: 'BNB' },
  { symbol: 'XRPUSDT', name: 'XRP' },
  { symbol: 'ADAUSDT', name: 'Cardano' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin' },
  { symbol: 'AVAXUSDT', name: 'Avalanche' },
];

export default function AddPositionModal({ onClose }: AddPositionModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [coinQuery, setCoinQuery] = useState('');
  const [selected, setSelected] = useState<{ symbol: string; name: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const filtered = POPULAR.filter(
    (c) =>
      c.name.toLowerCase().includes(coinQuery.toLowerCase()) ||
      c.symbol.toLowerCase().includes(coinQuery.toLowerCase()),
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!selected) {
      setError('Please select a coin.');
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);

    const quantity = parseFloat(data.get('quantity') as string);
    const avgBuyPrice = parseFloat(data.get('avgBuyPrice') as string);
    const buyDate = data.get('buyDate') as string;

    if (!quantity || quantity <= 0) { setError('Enter a valid quantity.'); return; }
    if (!avgBuyPrice || avgBuyPrice <= 0) { setError('Enter a valid buy price.'); return; }
    if (!buyDate) { setError('Select a buy date.'); return; }

    const input: AddPositionInput = {
      coinSymbol: selected.symbol,
      coinName: selected.name,
      quantity,
      avgBuyPrice,
      buyDate,
      notes: data.get('notes') as string,
    };

    startTransition(async () => {
      try {
        await addPosition(input);
        onClose();
      } catch {
        setError('Failed to add position. Try again.');
      }
    });
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Add position"
    >
      <div className="w-full max-w-md bg-dark-500 rounded-2xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Plus size={18} className="text-[#adef37]" aria-hidden="true" />
            Add Position
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Coin selector */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300 font-medium">Coin</label>
            {selected ? (
              <div className="flex items-center justify-between bg-dark-400 rounded-xl px-4 py-3 border border-[#adef37]/30">
                <div>
                  <p className="font-semibold text-white">{selected.name}</p>
                  <p className="text-xs text-gray-400">{selected.symbol}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setCoinQuery(''); }}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Change coin"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search coin..."
                    value={coinQuery}
                    onChange={(e) => setCoinQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-dark-400 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#adef37]/50"
                    aria-label="Search coin"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto custom-scrollbar">
                  {filtered.map((c) => (
                    <button
                      key={c.symbol}
                      type="button"
                      onClick={() => setSelected(c)}
                      className="flex flex-col items-start px-3 py-2.5 bg-dark-400 hover:bg-dark-400/60 rounded-xl border border-white/5 hover:border-[#adef37]/30 transition-all text-left"
                    >
                      <span className="text-sm font-semibold text-white">{c.name}</span>
                      <span className="text-xs text-gray-400">{c.symbol.replace('USDT', '')}</span>
                    </button>
                  ))}
                  {filtered.length === 0 && (
                    <p className="col-span-2 text-center text-sm text-gray-500 py-3">No coins found</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="quantity" className="text-sm text-gray-300 font-medium">Quantity</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                step="any"
                min="0"
                placeholder="0.5"
                required
                className="w-full px-4 py-2.5 bg-dark-400 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#adef37]/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="avgBuyPrice" className="text-sm text-gray-300 font-medium">Buy Price (USD)</label>
              <input
                id="avgBuyPrice"
                name="avgBuyPrice"
                type="number"
                step="any"
                min="0"
                placeholder="65000"
                required
                className="w-full px-4 py-2.5 bg-dark-400 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#adef37]/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Buy Date */}
          <div className="space-y-1.5">
            <label htmlFor="buyDate" className="text-sm text-gray-300 font-medium">Buy Date</label>
            <input
              id="buyDate"
              name="buyDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              max={new Date().toISOString().slice(0, 10)}
              required
              className="w-full px-4 py-2.5 bg-dark-400 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#adef37]/50 [color-scheme:dark]"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="text-sm text-gray-300 font-medium">
              Notes <span className="text-gray-500">(optional)</span>
            </label>
            <input
              id="notes"
              name="notes"
              type="text"
              placeholder="e.g. Long-term hold"
              className="w-full px-4 py-2.5 bg-dark-400 border border-white/10 rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#adef37]/50"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !selected}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                isPending || !selected
                  ? 'bg-dark-400 text-gray-500 cursor-not-allowed'
                  : 'bg-[#adef37] text-black hover:bg-[#adef37]/90',
              )}
            >
              {isPending ? 'Adding…' : 'Add Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

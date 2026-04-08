'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deletePosition } from '@/app/actions/portfolio';
import AddPositionModal from './AddPositionModal';
import AllocationChart from './AllocationChart';
import CoinIcon from '@/app/components/CoinIcon';

interface EnrichedPosition {
  id: string;
  coinSymbol: string;
  coinName: string;
  quantity: number;
  avgBuyPrice: number;
  buyDate: Date;
  notes: string;
  currentPrice: number | null;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

interface StatCardProps { label: string; value: string; sub?: string; up?: boolean }

function StatCard({ label, value, sub, up }: StatCardProps) {
  return (
    <div className="bg-dark-500 rounded-xl px-5 py-5 border border-white/5 flex flex-col gap-1">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
      {sub !== undefined && (
        <p className={cn('text-sm font-medium', up === true ? 'text-green-500' : up === false ? 'text-red-400' : 'text-gray-400')}>
          {sub}
        </p>
      )}
    </div>
  );
}

export default function PortfolioClient({ positions }: { positions: EnrichedPosition[] }) {
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Calculations ──────────────────────────────────────────────────────────
  const totalCost = positions.reduce((sum, p) => sum + p.quantity * p.avgBuyPrice, 0);
  const totalValue = positions.reduce((sum, p) => {
    const price = p.currentPrice ?? p.avgBuyPrice;
    return sum + p.quantity * price;
  }, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
  const isPortfolioUp = totalPnl >= 0;

  // Allocation chart data (by current value)
  const chartLabels = positions.map((p) => p.coinName || p.coinSymbol.replace('USDT', ''));
  const chartValues = positions.map((p) => {
    const price = p.currentPrice ?? p.avgBuyPrice;
    return parseFloat((p.quantity * price).toFixed(2));
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      await deletePosition(id);
      setDeletingId(null);
    });
  };

  return (
    <>
      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Invested"
          value={`$${fmt(totalCost)}`}
        />
        <StatCard
          label="Current Value"
          value={`$${fmt(totalValue)}`}
        />
        <StatCard
          label="Total P&L"
          value={`${isPortfolioUp ? '+' : ''}$${fmt(Math.abs(totalPnl))}`}
          sub={fmtPct(totalPnlPct)}
          up={isPortfolioUp}
        />
        <StatCard
          label="Holdings"
          value={`${positions.length}`}
          sub={positions.length === 1 ? '1 position' : `${positions.length} positions`}
        />
      </div>

      {/* ── Chart + Holdings ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Allocation chart */}
        {positions.length > 0 && (
          <div className="bg-dark-500 rounded-xl border border-white/5 p-5">
            <h3 className="text-base font-semibold text-white mb-2">Allocation</h3>
            <AllocationChart labels={chartLabels} values={chartValues} />
          </div>
        )}

        {/* Positions table */}
        <div className={cn('bg-dark-500 rounded-xl border border-white/5 flex flex-col', positions.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3')}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="text-base font-semibold text-white">Holdings</h3>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-black bg-[#adef37] px-3 py-1.5 rounded-lg hover:bg-[#adef37]/90 transition-colors"
              aria-label="Add new position"
            >
              <Plus size={15} aria-hidden="true" /> Add
            </button>
          </div>

          {positions.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-16 gap-4 text-center">
              <p className="text-gray-400">No positions yet.</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-5 py-2.5 bg-[#adef37] text-black font-semibold rounded-xl hover:bg-[#adef37]/90 transition-colors text-sm"
              >
                Add your first position
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs border-b border-white/5">
                    <th className="text-left px-5 py-3 font-medium">Coin</th>
                    <th className="text-right px-4 py-3 font-medium">Qty</th>
                    <th className="text-right px-4 py-3 font-medium">Avg Buy</th>
                    <th className="text-right px-4 py-3 font-medium">Price</th>
                    <th className="text-right px-4 py-3 font-medium">Value</th>
                    <th className="text-right px-4 py-3 font-medium">P&L</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => {
                    const price = pos.currentPrice ?? pos.avgBuyPrice;
                    const cost = pos.quantity * pos.avgBuyPrice;
                    const value = pos.quantity * price;
                    const pnl = value - cost;
                    const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
                    const isUp = pnl >= 0;
                    const symbol = pos.coinSymbol.replace('USDT', '');

                    return (
                      <tr key={pos.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-dark-400 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                              <CoinIcon symbol={symbol} className="w-full h-full object-contain p-1" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{symbol}</p>
                              <p className="text-xs text-gray-500">{pos.coinName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-right px-4 py-4 text-gray-300">
                          {pos.quantity.toLocaleString('en-US', { maximumFractionDigits: 8 })}
                        </td>
                        <td className="text-right px-4 py-4 text-gray-300">${fmt(pos.avgBuyPrice)}</td>
                        <td className="text-right px-4 py-4 font-medium text-white">
                          {pos.currentPrice !== null ? `$${fmt(pos.currentPrice)}` : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="text-right px-4 py-4 font-semibold text-white">${fmt(value)}</td>
                        <td className="text-right px-4 py-4">
                          <div className={cn('flex flex-col items-end', isUp ? 'text-green-500' : 'text-red-400')}>
                            <span className="font-semibold flex items-center gap-0.5">
                              {isUp
                                ? <TrendingUp size={12} aria-hidden="true" />
                                : <TrendingDown size={12} aria-hidden="true" />}
                              {isUp ? '+' : ''}${fmt(Math.abs(pnl))}
                            </span>
                            <span className="text-xs">{fmtPct(pnlPct)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleDelete(pos.id)}
                            disabled={isPending && deletingId === pos.id}
                            aria-label={`Delete ${symbol} position`}
                            className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-30"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add position modal */}
      {showModal && <AddPositionModal onClose={() => setShowModal(false)} />}
    </>
  );
}

'use client';

import { useTransition } from 'react';
import { Bell, BellOff, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteAlert, dismissTriggeredAlerts } from '@/app/actions/alerts';

interface Alert {
  id: string;
  coinSymbol: string;
  coinName: string;
  condition: string;
  targetPrice: number;
  triggered: boolean;
  triggeredAt: Date | null;
  createdAt: Date;
  currentPrice: number | null;
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

export default function AlertsClient({ alerts }: { alerts: Alert[] }) {
  const [isPending, startTransition] = useTransition();

  const triggered = alerts.filter((a) => a.triggered);
  const pending = alerts.filter((a) => !a.triggered);

  const handleDelete = (id: string) => {
    startTransition(async () => { await deleteAlert(id); });
  };

  const handleDismissAll = () => {
    startTransition(async () => { await dismissTriggeredAlerts(); });
  };

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-dark-400 flex items-center justify-center">
          <BellOff className="text-gray-600" size={28} />
        </div>
        <div>
          <p className="text-lg font-medium text-white">No alerts set</p>
          <p className="text-gray-400 text-sm mt-1">
            Open any coin and click &ldquo;Set Price Alert&rdquo; to get notified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Triggered alerts ── */}
      {triggered.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#adef37]" aria-hidden="true" />
              Triggered ({triggered.length})
            </h3>
            <button
              onClick={handleDismissAll}
              disabled={isPending}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Dismiss all
            </button>
          </div>

          <div className="space-y-2">
            {triggered.map((alert) => {
              const symbol = alert.coinSymbol.replace('USDT', '');
              return (
                <div
                  key={alert.id}
                  className="flex items-center justify-between bg-dark-500 border border-[#adef37]/20 rounded-xl px-5 py-4 gap-4"
                  role="status"
                  aria-label={`Alert triggered: ${alert.coinName} ${alert.condition} $${fmt(alert.targetPrice)}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-[#adef37] shrink-0 animate-pulse" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{symbol}</p>
                      <p className="text-xs text-gray-400">
                        Price{' '}
                        <span className={alert.condition === 'above' ? 'text-green-400' : 'text-red-400'}>
                          {alert.condition}
                        </span>{' '}
                        ${fmt(alert.targetPrice)}
                        {alert.triggeredAt && (
                          <> · {new Date(alert.triggeredAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    disabled={isPending}
                    aria-label={`Dismiss ${symbol} alert`}
                    className="text-gray-500 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Pending alerts ── */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Bell size={16} className="text-gray-400" aria-hidden="true" />
            Watching ({pending.length})
          </h3>

          <div className="bg-dark-500 rounded-xl border border-white/5 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-dark-400 text-xs text-gray-400 font-medium">
              <span>Coin</span>
              <span>Condition</span>
              <span>Target</span>
              <span>Current</span>
              <span />
            </div>

            {pending.map((alert, i) => {
              const symbol = alert.coinSymbol.replace('USDT', '');
              const diff = alert.currentPrice
                ? ((alert.currentPrice - alert.targetPrice) / alert.targetPrice) * 100
                : null;
              const isAbove = alert.condition === 'above';
              const distance = diff !== null
                ? `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}% away`
                : null;

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-5 py-4 text-sm',
                    i < pending.length - 1 && 'border-b border-white/5',
                  )}
                >
                  {/* Coin */}
                  <div>
                    <p className="font-semibold text-white">{symbol}</p>
                    <p className="text-xs text-gray-500">{alert.coinName}</p>
                  </div>

                  {/* Condition badge */}
                  <span
                    className={cn(
                      'text-xs font-semibold px-2.5 py-1 rounded-full',
                      isAbove
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-red-500/15 text-red-400',
                    )}
                  >
                    {isAbove ? '↑ Above' : '↓ Below'}
                  </span>

                  {/* Target */}
                  <span className="font-medium text-white">${fmt(alert.targetPrice)}</span>

                  {/* Current price + distance */}
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {alert.currentPrice !== null ? `$${fmt(alert.currentPrice)}` : '—'}
                    </p>
                    {distance && (
                      <p className="text-xs text-gray-500">{distance}</p>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(alert.id)}
                    disabled={isPending}
                    aria-label={`Delete ${symbol} alert`}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

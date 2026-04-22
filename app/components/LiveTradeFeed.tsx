'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Trade {
  base: string;
  direction: 'buy' | 'sell';
  price: number;
  volume: number;
  timestamp: number;
}

export default function LiveTradeFeed({ coinId }: { coinId: string }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const symbol = coinId.toLowerCase().endsWith('usdt')
      ? coinId.toLowerCase()
      : `${coinId.toLowerCase()}usdt`;

    const ws = new WebSocket(`wss://stream.binance.us:9443/ws/${symbol}@trade`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.e === 'trade') {
          const newTrade: Trade = {
            base: data.s.replace('USDT', ''),
            direction: data.m ? 'sell' : 'buy',
            price: parseFloat(data.p),
            volume: parseFloat(data.q),
            timestamp: data.T,
          };
          setTrades((prev) => [newTrade, ...prev].slice(0, 30));
        }
      } catch {}
    };

    return () => {
      wsRef.current?.close();
    };
  }, [coinId]);

  return (
    <div
      className="bg-dark-500 rounded-2xl p-6 shadow-xl border border-white/5 h-100 flex flex-col xl:h-auto"
      aria-label="Live trade feed"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Clock className="text-[#adef37] w-5 h-5" aria-hidden="true" />
        </motion.span>
        Live Trade Feed
      </h3>

      <div
        className="flex-1 overflow-y-auto custom-scrollbar pr-2"
        role="log"
        aria-live="polite"
        aria-label="Recent trades"
      >
        <div className="space-y-2">
          {trades.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-400 mt-10"
              role="status"
            >
              Waiting for live trades…
              <br />
              <span className="text-xs opacity-50">(Binance Native Stream)</span>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {trades.map((trade, idx) => (
                <motion.div
                  key={`${trade.timestamp}-${idx}`}
                  initial={{ opacity: 0, y: -14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg bg-dark-400/50 border hover:bg-dark-400/80 transition-colors',
                    trade.direction === 'buy'
                      ? 'border-green-500/15 shadow-[0_0_8px_rgba(34,197,94,0.04)]'
                      : 'border-red-500/15 shadow-[0_0_8px_rgba(239,68,68,0.04)]',
                  )}
                >
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        'text-sm font-semibold flex items-center gap-1',
                        trade.direction === 'buy' ? 'text-green-500' : 'text-red-500',
                      )}
                    >
                      {trade.direction === 'buy' ? (
                        <ArrowUpRight size={14} />
                      ) : (
                        <ArrowDownRight size={14} />
                      )}
                      {trade.direction.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(trade.timestamp).toLocaleTimeString('en-US', {
                        timeZone: 'America/New_York',
                        hour12: false,
                      })}{' '}
                      EST
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      ${trade.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </div>
                    <div className="text-xs text-gray-400">
                      Vol: {trade.volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

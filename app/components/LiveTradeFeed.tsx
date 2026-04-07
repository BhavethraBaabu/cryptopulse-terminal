'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

interface Trade {
  base: string;
  direction: 'buy' | 'sell';
  price: number;
  volume: number;
  timestamp: number;
}

export default function LiveTradeFeed({ coinId }: { coinId: string }) { // coinId will be like 'btc' or 'btcusdt'
  const [trades, setTrades] = useState<Trade[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Ensure the symbol format is lowercase and ends with usdt if it doesn't already
    const symbol = coinId.toLowerCase().endsWith('usdt') ? coinId.toLowerCase() : `${coinId.toLowerCase()}usdt`;
    
    // Connect to Binance Native Trade Stream
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

          setTrades(prev => {
            const updated = [newTrade, ...prev];
            // Keep last 30 trades to avoid memory leak
            return updated.slice(0, 30);
          });
        }
      } catch (err) {}
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [coinId]);

  return (
    <div className="bg-dark-500 rounded-2xl p-6 shadow-xl border border-white/5 h-[400px] flex flex-col xl:h-auto">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Clock className="text-[#adef37] w-5 h-5" />
        Live Trade Feed
      </h3>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="space-y-3">
          {trades.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">Waiting for live trades...<br/><span className="text-xs opacity-50">(Binance Native Stream)</span></div>
          ) : (
            trades.map((trade, idx) => (
              <div key={`${trade.timestamp}-${idx}`} className="flex items-center justify-between p-3 rounded-lg bg-dark-400/50 border border-white/5 hover:bg-dark-400/80 transition-colors">
                <div className="flex flex-col">
                  <span className={cn("text-sm font-semibold flex items-center gap-1", trade.direction === 'buy' ? 'text-green-500' : 'text-red-500')}>
                    {trade.direction === 'buy' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {trade.direction.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(trade.timestamp).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false })} EST</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">${trade.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                  <div className="text-xs text-gray-400">Vol: {trade.volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

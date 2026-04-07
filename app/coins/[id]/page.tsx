import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CandlestickChart from '@/app/components/CandlestickChart';
import LiveTradeFeed from '@/app/components/LiveTradeFeed';
import CoinIcon from '@/app/components/CoinIcon';
import { TrendingUp, TrendingDown, ArrowUpRight, ExternalLink, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function CoinPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams; // e.g., 'BTCUSDT'

  let tickerData: any = null;
  let ohlcData: { x: number, y: number[] }[] = [];

  try {
    const res = await fetch(`https://api.binance.us/api/v3/ticker/24hr?symbol=${id}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      if (res.status === 400 || res.status === 404) return notFound();
      throw new Error(`Binance API error: ${res.status}`);
    }
    tickerData = await res.json();
    
    // Fetch historical data for chart
    const resOhlc = await fetch(`https://api.binance.us/api/v3/klines?symbol=${id}&interval=1m&limit=60`, { next: { revalidate: 60 } });
    if (resOhlc.ok) {
        const rawOhlc = await resOhlc.json();
        if (Array.isArray(rawOhlc)) {
          ohlcData = rawOhlc.map((point: any[]) => ({
            x: point[0],
            y: [parseFloat(point[1]), parseFloat(point[2]), parseFloat(point[3]), parseFloat(point[4])]
          }));
        }
    }
  } catch (err) {
    console.error(err);
  }

  if (!tickerData) {
    return (
      <main className="main-container flex items-center justify-center py-20 min-h-screen">
        <div className="text-white text-xl animate-pulse">Loading data...</div>
      </main>
    );
  }

  const currentPrice = parseFloat(tickerData.lastPrice) || 0;
  const change24h = parseFloat(tickerData.priceChangePercent) || 0;
  const isUp = change24h >= 0;
  const symbolTrimmed = tickerData.symbol.replace('USDT', '');

  return (
    <main id="coin-details-page">
      <section className="primary space-y-6">
        <CandlestickChart
          coinId={id}
          coinName={symbolTrimmed}
          coinSymbol={symbolTrimmed}
          coinImage={`https://assets.coincap.io/assets/icons/${symbolTrimmed.toLowerCase()}@2x.png`}
          currentPrice={currentPrice}
          initialData={ohlcData}
          className="min-h-[500px] xl:min-h-[650px]"
        />
        
        <div id="coin-header" className="mt-8 mb-6">
           <h3 className="text-3xl font-medium tracking-tight">Market Statistics</h3>
        </div>

        <LiveTradeFeed coinId={symbolTrimmed.toLowerCase()} />
      </section>

      <section className="secondary space-y-8">
        <div id="coin-card">
          <div className="header">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
           <div className="bg-dark-400 p-2 rounded-2xl shadow-lg border-2 border-white/5 flex-shrink-0 flex items-center justify-center w-16 h-16 relative overflow-hidden">
               <CoinIcon symbol={symbolTrimmed} className="w-full h-full object-contain p-1 z-10" />
          </div>
          
          <div className="flex flex-col">
               <h3>{symbolTrimmed}</h3>
               <p>{tickerData.symbol}</p>
            </div>
          </div>
          </div>
          
          <div className="price-row">
            <div className="price">
               ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: currentPrice % 1 === 0 ? 0 : 2, maximumFractionDigits: currentPrice % 1 === 0 ? 0 : 6 })}
            </div>
            <div className={cn('change', isUp ? 'badge badge-up' : 'badge badge-down')}>
               {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
               <span>{Math.abs(change24h).toFixed(2)}%</span>
            </div>
          </div>
          
          <div className="stats border-t border-dark-400 pt-4 pb-2">
             <div className="stat-row">
                <span className="label">24h High</span>
                <span className="value">${parseFloat(tickerData.highPrice).toLocaleString('en-US', { maximumFractionDigits: 6 })}</span>
             </div>
             <div className="stat-row">
                <span className="label">24h Low</span>
                <span className="value">${parseFloat(tickerData.lowPrice).toLocaleString('en-US', { maximumFractionDigits: 6 })}</span>
             </div>
             <div className="stat-row">
                <span className="label">Weighted Avg</span>
                <span className="value">${parseFloat(tickerData.weightedAvgPrice).toLocaleString('en-US', { maximumFractionDigits: 6 })}</span>
             </div>
          </div>
        </div>

        <div className="details">
          <h4>Market Details</h4>
          <ul className="details-grid">
             <li>
               <p className="label">Volume (USDT)</p>
               <p className="text-base font-medium">${parseFloat(tickerData.quoteVolume).toLocaleString() || '-'}</p>
             </li>
             <li>
               <p className="label">Total Trades</p>
               <p className="text-base font-medium">{tickerData.count?.toLocaleString() || '-'}</p>
             </li>
             <li>
               <p className="label">Trade on Binance</p>
               <div className="link">
                 <Link href={`https://www.binance.com/en/trade/${tickerData.symbol}`} target="_blank">
                   Binance Protocol
                 </Link>
                 <ArrowUpRight size={16} />
               </div>
             </li>
          </ul>
        </div>
      </section>
    </main>
  );
}

'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import DataTable from './DataTable';
import CandlestickChart from './CandlestickChart';
import { useBinanceLive } from '@/lib/useBinanceLive';

export default function DashboardClient({ 
  coin, 
  ohlcData, 
  trendingCoins 
}: { 
  coin: any; 
  ohlcData: any; 
  trendingCoins: any[]; 
}) {
  const symbols = useMemo(() => {
    return Array.from(new Set([...trendingCoins.map(tc => tc.item.binanceSymbol), coin.binanceSymbol]));
  }, [trendingCoins, coin.binanceSymbol]);

  const liveData = useBinanceLive(symbols);

  const mergedTrendingCoins = useMemo(() => {
    return trendingCoins.map(tc => {
      const live = liveData[tc.item.binanceSymbol];
      if (live) {
        return {
          ...tc,
          item: {
            ...tc.item,
            data: {
              ...tc.item.data,
              price: live.price,
              price_change_percentage_24h: { usd: live.change }
            }
          }
        };
      }
      return tc;
    });
  }, [trendingCoins, liveData]);

  const columns = [
    {
      header: <span className="bg-transparent border-none text-purple-100 font-medium whitespace-nowrap">Name</span>,
      cellClassName: 'name-cell border-dark-400 py-3 px-6 whitespace-nowrap',
      cell: (row: any) => {
        const item = row.item;
        return (
          <Link href={`/coins/${item.binanceSymbol}`} className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-1.5 opacity-80 mb-0.5">
              <Image src="/logo.svg" alt="CoinPulse" width={14} height={14} className="w-3.5 h-auto object-contain" />
              <span className="text-[10px] font-semibold text-white tracking-wider">CoinPulse</span>
            </div>
            <div className="flex items-center gap-2">
              <Image src={item.large} alt={item.name} width={24} height={24} className="rounded-full rounded-sm" />
              <p className="font-medium text-white">{item.name}</p>
            </div>
          </Link>
        )
      }
    },
    {
      header: <span className="bg-transparent border-none text-purple-100 font-medium whitespace-nowrap">24h Change</span>,
      cellClassName: 'name-cell border-dark-400 py-3 px-6 whitespace-nowrap',
      cell: (row: any) => {
        const item = row.item;
        const change = item.data.price_change_percentage_24h?.usd || 0;
        const isTrendingUp = change >= 0;
        return (
          <div className={cn('flex flex-col items-start gap-1 font-medium', isTrendingUp ? 'text-green-500' : 'text-red-500')}>
            {isTrendingUp ? (
              <TrendingUp width={18} height={18} />
            ) : (
              <TrendingDown width={18} height={18} />
            )}
            <p className="text-sm">{Math.abs(change).toFixed(2)}%</p>
          </div>
        )
      }
    },
    {
      header: <span className="bg-transparent border-none text-purple-100 font-medium whitespace-nowrap">Price</span>,
      cellClassName: 'price-cell border-dark-400 py-3 px-6 whitespace-nowrap text-left',
      cell: (row: any) => {
        const price = row.item.data.price;
        return (
          <span className="font-medium text-white transition-colors duration-300">
            ${price.toLocaleString('en-US', { minimumFractionDigits: price % 1 === 0 ? 0 : 2, maximumFractionDigits: price % 1 === 0 ? 0 : 6 })}
          </span>
        )
      }
    }
  ];

  const liveChartPrice = liveData[coin.binanceSymbol]?.price || coin.market_data.current_price.usd;

  return (
    <section className="home-grid">
      <div id="coin-overview" className="w-full h-full xl:col-span-2 flex flex-col">
        <CandlestickChart
          coinId={coin.id}
          coinName={coin.name}
          coinSymbol={coin.symbol.toUpperCase()}
          coinImage={coin.image.large}
          currentPrice={liveChartPrice}
          initialData={ohlcData.length > 0 ? ohlcData : []}
          className="flex-1"
        >
          <div className="header pt-2">
            <Image src={coin.image.large} alt={coin.name} width={56} height={56} className="bg-dark-400 rounded-full" />
            <div className="info">
              <p>
                {coin.name} / {coin.symbol.toUpperCase()}
              </p>
              <h1>${liveChartPrice.toLocaleString('en-US', { minimumFractionDigits: liveChartPrice % 1 === 0 ? 0 : 2, maximumFractionDigits: liveChartPrice % 1 === 0 ? 0 : 6 })}</h1>
            </div>
          </div>
        </CandlestickChart>
      </div>

      <div id="trending-coins">
        <h4>Trending Coins</h4>
        <DataTable
          data={mergedTrendingCoins.slice(0, 6)}
          columns={columns}
          rowKey={(row: any) => row.item.id}
          tableClassName="trending-coins-table"
          headerCellClassName="py-3!"
          bodyCellClassName="py-2!"
        />
      </div>
    </section>
  );
}

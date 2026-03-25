"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ApexOptions } from 'apexcharts';
import { fetchBinanceKlines } from '@/lib/binance.actions';

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export type TimeInterval = '1h' | '1d' | '1w' | '1m';

interface CandlestickChartProps {
  coinId?: string;
  coinName?: string;
  coinSymbol?: string;
  coinImage?: string;
  currentPrice?: number;
  initialData?: { x: number; y: number[] }[]; // [timestamp, open, high, low, close]
  className?: string;
  children?: React.ReactNode;
}

export default function CandlestickChart({
  coinId = "bitcoin",
  coinName = "Bitcoin",
  coinSymbol = "BTC",
  coinImage = "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  currentPrice = 35352.02,
  initialData = [],
  className,
  children
}: CandlestickChartProps) {
  const [interval, setInterval] = useState<TimeInterval>('1d');
  const [data, setData] = useState<{ x: number; y: number[] }[]>(() =>
    initialData.map(point => {
      const tzOffset = new Date(point.x).getTimezoneOffset() * 60000;
      return { ...point, x: point.x + tzOffset };
    })
  );
  const [isLoading, setIsLoading] = useState(false);

  const intervals: TimeInterval[] = ['1h', '1d', '1w', '1m'];

  useEffect(() => {
    let intervalStr = '1d';
    let limit = 30; // 30 candles

    if (interval === '1h') { intervalStr = '1h'; limit = 24; }
    if (interval === '1d') { intervalStr = '1d'; limit = 30; }
    if (interval === '1w') { intervalStr = '1w'; limit = 12; }
    if (interval === '1m') { intervalStr = '1M'; limit = 12; }

    const loadData = async () => {
      setIsLoading(true);
      try {
        const binanceSymbol = `${coinSymbol.toUpperCase().replace('USDT', '')}USDT`;
        const rawOhlc = await fetchBinanceKlines(binanceSymbol, intervalStr, limit);

        if (Array.isArray(rawOhlc)) {
          const formattedData = rawOhlc.map((point: any[]) => {
            const ts = point[0];
            // Format to UTC for ApexCharts
            const tzOffset = new Date(ts).getTimezoneOffset() * 60000;
            return {
              x: ts,
              y: [parseFloat(point[1]), parseFloat(point[2]), parseFloat(point[3]), parseFloat(point[4])]
            };
          });
          setData(formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch OHLC data for chart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [interval, coinSymbol]);

  // Use currentPrice as the most accurate live close
  const lastClose = currentPrice;
  const prevClose = data.length > 1 ? data[data.length - 2].y[3] : lastClose;
  const isUp = lastClose >= prevClose;

  const options: ApexOptions = {
    chart: {
      type: 'candlestick',
      height: '100%',
      background: 'transparent',
      toolbar: {
        show: false
      },
      animations: {
        enabled: false
      }
    },
    grid: {
      borderColor: '#2D3748',
      strokeDashArray: 4,
      xaxis: {
        lines: { show: false }
      },
      yaxis: {
        lines: { show: false }
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#2ebe7b', // green-400
          downward: '#ff685f' // red-500
        },
        wick: {
          useFillColor: true
        }
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#A0AEC0',
          fontSize: '11px'
        },
        datetimeFormatter: {
          hour: 'HH:mm'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false }
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        style: {
          colors: '#A0AEC0',
          fontSize: '11px'
        },
        formatter: (value) => {
          return `${(value / 1000).toFixed(3)}`; // Format as 50.000 etc
        }
      }
    },
    annotations: {
      yaxis: [
        {
          y: lastClose,
          borderColor: isUp ? '#2ebe7b' : '#ff685f',
          strokeDashArray: 4,
          label: {
            borderColor: 'transparent',
            style: {
              color: '#000',
              background: isUp ? '#2ebe7b' : '#ff685f',
              fontSize: '11px',
              fontWeight: 600,
              padding: { left: 8, right: 8, top: 4, bottom: 4 }
            },
            text: `$${(lastClose / 1000).toFixed(0)}K`,
            offsetX: 0,
            offsetY: 0
          }
        }
      ]
    },
    tooltip: {
      theme: 'dark',
      x: {
        formatter: function (val: number) {
          const d = new Date(val);
          return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) + ' ETC';
        }
      }
    }
  };

  const series = [{
    name: 'candle',
    data: data
  }];

  return (
    <div id="candlestick-chart">
      <div className="flex justify-between flex-col xl:flex-row xl:items-end">
        <div className="chart-header">
          {children || (
            <div className="header pt-2 flex items-center gap-3">
              <Image src={coinImage} alt={coinName} width={56} height={56} className="rounded-full" />
              <div className="info flex flex-col">
                <p className="text-sm text-gray-400">
                  {coinName} / {coinSymbol}
                </p>
                <h1 className="text-2xl font-bold">${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</h1>
              </div>
            </div>
          )}
        </div>
        
        <div className="button-group pb-5">
          {intervals.map((int) => (
            <button
              key={int}
              onClick={() => setInterval(int)}
              className={interval === int ? 'config-button-active' : 'config-button'}
            >
              {int}
            </button>
          ))}
        </div>
      </div>

      <div className="chart relative">
         {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#1A202C]/50 backdrop-blur-sm">
            <span className="text-white text-sm">Loading chart data...</span>
          </div>
        )}
        {typeof window !== 'undefined' && (
          <ReactApexChart
            options={options}
            series={series}
            type="candlestick"
            height="100%"
          />
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ApexOptions } from 'apexcharts';
import { fetchBinanceKlines } from '@/lib/binance.actions';


const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export type TimeInterval = '5s' | '1m' | '1h' | '1d' | '1w';

const getEstOffset = (ts: number) => {
  const date = new Date(ts);
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const estDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  return estDate.getTime() - utcDate.getTime();
};

interface CandlestickChartProps {
  coinId?: string;
  coinName?: string;
  coinSymbol?: string;
  coinImage?: string;
  currentPrice?: number;
  initialData?: { x: number; y: number | number[] }[]; // [timestamp, open, high, low, close] or single number for line string
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
  const [interval, setInterval] = useState<TimeInterval>('1m');
  const [data, setData] = useState<{ x: number; y: number | number[] }[]>(() =>
    initialData.map(point => {
      return { ...point, x: point.x + getEstOffset(point.x) };
    })
  );
  const [lineHistory, setLineHistory] = useState<{ x: number; y: number }[]>(() => {
    if (typeof window !== 'undefined') {
       try {
         const saved = localStorage.getItem(`coinpulse_line_${coinSymbol}`);
         if (saved) {
             const parsed = JSON.parse(saved);
             const nowTs = Date.now();
             const currentEstTs = nowTs + getEstOffset(nowTs);
             
             const valid = parsed.filter((p: {x: number, y: number}) => currentEstTs - p.x <= 300000);
             return valid;
         }
       } catch(e) {}
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);

  const intervals: TimeInterval[] = ['5s', '1m', '1h', '1d', '1w'];

  // Sync autonomous memory dynamically down to persistent browser cache aggressively.
  useEffect(() => {
    if (typeof window !== 'undefined' && lineHistory.length > 0) {
       localStorage.setItem(`coinpulse_line_${coinSymbol}`, JSON.stringify(lineHistory));
    }
  }, [lineHistory, coinSymbol]);

  useEffect(() => {
    if (interval !== '5s') { setData([]); }
    let intervalStr = '1m';
    let limit = 60; 

    if (interval === '5s') { intervalStr = '5s'; limit = 0; }
    if (interval === '1h') { intervalStr = '1h'; limit = 24; }
    if (interval === '1d') { intervalStr = '1d'; limit = 30; }
    if (interval === '1w') { intervalStr = '1w'; limit = 12; }
    if (interval === '1m') { intervalStr = '1m'; limit = 60; }

    const loadData = async () => {
      if (interval === '5s') return; // Handled fully by autonomous lineHistory
      
      setIsLoading(true);
      try {
        const binanceSymbol = `${coinSymbol.toUpperCase().replace('USDT', '')}USDT`;
        const rawOhlc = await fetchBinanceKlines(binanceSymbol, intervalStr, limit);

        if (Array.isArray(rawOhlc)) {
          const formattedData = rawOhlc.map((point: any[]) => {
            const ts = point[0];
            return {
              x: ts + getEstOffset(ts),
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

  // Bounding Live Aggregator that updates Line History natively in the background
  useEffect(() => {
    if (!currentPrice) return;
    
    const nowTs = Date.now();
    const currentEstTime = nowTs + getEstOffset(nowTs);
    
    setLineHistory(prev => {
      if (prev.length === 0) return [{ x: currentEstTime, y: currentPrice }];
      
      const lastPoint = prev[prev.length - 1];
      if (currentEstTime >= lastPoint.x + 1000) {
         // Push new tick every 1 second continuously across entire dashboard lifecycle
         const nextData = [...prev, { x: currentEstTime, y: currentPrice }];
         if (nextData.length > 300) return nextData.slice(nextData.length - 300); // 5 min rolling buffer
         return nextData;
      }
      
      return prev;
    });
  }, [currentPrice]);

  // Dynamic Real-Time Aggregator Pipeline for Candlesticks
  useEffect(() => {
    if (!currentPrice || data.length === 0 || interval === '5s') return;
    
    setData(prevData => {
      if (prevData.length === 0) return prevData;
      
      const lastCandle = prevData[prevData.length - 1];
      const nowTs = Date.now();
      const currentEstTime = nowTs + getEstOffset(nowTs);
      
      let bucketSizeMs = 60000; // 1m
      if (interval === '1h') bucketSizeMs = 3600000;
      if (interval === '1d') bucketSizeMs = 86400000;
      if (interval === '1w') bucketSizeMs = 604800000;
      
      // Spin a new bucket explicitly if we overlap the frame boundary
      if (currentEstTime >= lastCandle.x + bucketSizeMs) {
        let nextData = [...prevData];
        let tail = lastCandle;
        
        while (currentEstTime >= tail.x + bucketSizeMs) {
           const nextBucket = tail.x + bucketSizeMs;
           tail = {
             x: nextBucket,
             y: [currentPrice, currentPrice, currentPrice, currentPrice]
           };
           nextData.push(tail);
        }
        
        if (nextData.length > 200) nextData = nextData.slice(nextData.length - 200);
        return nextData;
      }
      
      const lastCandleY = lastCandle.y as number[];
      const newHigh = Math.max(lastCandleY[1], currentPrice);
      const newLow = Math.min(lastCandleY[2], currentPrice);
      
      if (lastCandleY[1] === newHigh && lastCandleY[2] === newLow && lastCandleY[3] === currentPrice) {
         return prevData;
      }
      
      const updatedCandle = {
        ...lastCandle,
        y: [lastCandleY[0], newHigh, newLow, currentPrice]
      };
      
      const newData = [...prevData];
      newData[newData.length - 1] = updatedCandle;
      return newData;
    });
  }, [currentPrice, interval]);

  // Use currentPrice as the most accurate live close
  const isLineChart = interval === '5s';
  const lastClose = currentPrice;
  const prevCloseOption = isLineChart && lineHistory.length > 1 ? lineHistory[lineHistory.length - 2].y : (data.length > 1 ? data[data.length - 2].y : lastClose);
  const prevClose = Array.isArray(prevCloseOption) ? prevCloseOption[3] : prevCloseOption;
  const isUp = lastClose >= prevClose;

  const options: ApexOptions = {
    chart: {
      type: isLineChart ? 'line' : 'candlestick',
      height: '100%',
      background: 'transparent',
      toolbar: { show: false },
      animations: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: isLineChart ? 2 : 1,
      colors: isLineChart ? ['#adef37'] : undefined,
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
      range: isLineChart ? 5 * 60 * 1000 : undefined, // 5 min scroll lock for seconds chart
      labels: {
        style: {
          colors: '#A0AEC0',
          fontSize: '11px'
        },
        datetimeFormatter: {
          hour: isLineChart ? 'HH:mm:ss' : 'HH:mm',
          minute: isLineChart ? 'HH:mm:ss' : 'HH:mm',
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false }
    },
    yaxis: {
      opposite: true,
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
            position: 'right',
            style: {
              color: '#fff',
              background: isUp ? '#2ebe7b' : '#ff685f',
              fontSize: '11px',
              fontWeight: 600,
              padding: { left: 6, right: 6, top: 4, bottom: 4 }
            },
            text: `${(lastClose / 1000).toFixed(2)}K`,
            offsetX: 45,
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
            timeZone: 'UTC',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: isLineChart ? '2-digit' : undefined,
            hour12: false
          }) + ' EST';
        }
      }
    }
  };

  const series = [{
    name: 'candle',
    data: isLineChart ? lineHistory : data
  }];

  return (
    <div id="candlestick-chart" className={cn("flex flex-col w-full min-h-[400px]", className)}>
      <div className="flex justify-between flex-col xl:flex-row xl:items-end shrink-0">
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

      <div className="chart relative flex-1 w-full mt-2 min-h-[300px]">
         {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#1A202C]/50 backdrop-blur-sm">
            <span className="text-white text-sm">Loading chart data...</span>
          </div>
        )}
        <ReactApexChart
          key={isLineChart ? 'line-chart' : 'candle-chart'}
          options={options}
          series={series}
          type={isLineChart ? "line" : "candlestick"}
          height="100%"
        />
      </div>
    </div>
  );
}

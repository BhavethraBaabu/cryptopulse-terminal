import React from 'react';
import DashboardClient from './components/DashboardClient';
import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import { TrendingUp, TrendingDown } from 'lucide-react';
import DataTable from '@/app/components/DataTable';
import { cn } from '@/lib/utils';

// Use Binance symbols for free public queries
const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];

const COIN_METADATA: Record<string, { id: string, name: string, image: string }> = {
  "BTCUSDT": { id: "bitcoin", name: "Bitcoin", image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
  "ETHUSDT": { id: "ethereum", name: "Ethereum", image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  "BNBUSDT": { id: "binancecoin", name: "BNB", image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
  "SOLUSDT": { id: "solana", name: "Solana", image: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  "XRPUSDT": { id: "ripple", name: "XRP", image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" }
};

const page = async () => {
  let ohlcData: { x: number, y: number[] }[] = [];
  try {
    const response = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=24', { next: { revalidate: 60 } });
    if (!response.ok) throw new Error("Failed to fetch klines from binance.com");
    const rawOhlc = await response.json();
    
    if (Array.isArray(rawOhlc)) {
      ohlcData = rawOhlc.map((point: any[]) => ({
        x: point[0], // timestamp Open
        y: [parseFloat(point[1]), parseFloat(point[2]), parseFloat(point[3]), parseFloat(point[4])] // O, H, L, C
      }));
    }
  } catch (error) {
    console.error("Failed to fetch klines:", error);
  }

  let trendingCoins: any[] = [];
  try {
    const querySymbols = JSON.stringify(SYMBOLS);
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${querySymbols}`, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error("Failed to fetch ticker from binance.com");
    const marketsData = await response.json();

    if (Array.isArray(marketsData)) {
      trendingCoins = marketsData.map((marketCoin: any) => {
        const meta = COIN_METADATA[marketCoin.symbol];
        return {
          item: {
            id: meta.id,
            binanceSymbol: marketCoin.symbol,
            name: meta.name,
            symbol: marketCoin.symbol.replace('USDT', ''),
            market_cap_rank: 0,
            thumb: meta.image,
            large: meta.image,
            data: {
              price: parseFloat(marketCoin.lastPrice),
              price_change_percentage_24h: { usd: parseFloat(marketCoin.priceChangePercent) }
            }
          }
        };
      });
    }
  } catch (error) {
    console.error("Failed to fetch trending coins:", error);
  }

  // Categories Fetching using CoinGecko public unauth endpoint
  let categories: any[] = [];
  try {
    categories = await fetcher<any[]>('/coins/categories');
  } catch (err) {
    console.error("Failed to fetch categories:", err);
  }

  const categoryColumns = [
    { header: 'Category', cellClassName: 'category-cell', cell: (category: any) => category.name },
    {
      header: 'Top Gainers',
      cellClassName: 'top-gainers-cell flex items-center',
      cell: (category: any) =>
        category.top_3_coins?.map((coin: string) => (
          <Image src={coin} alt="coin" key={coin} width={28} height={28} className="rounded-full" />
        )) || null,
    },
    {
      header: '24h Change',
      cellClassName: 'change-header-cell',
      cell: (category: any) => {
        const change = category.market_cap_change_24h || 0;
        const isTrendingUp = change >= 0;
        return (
          <div className={cn('change-cell', isTrendingUp ? 'text-green-500' : 'text-red-500')}>
            <p className="flex items-center gap-1">
              {Math.abs(change).toFixed(2)}%
              {isTrendingUp ? (
                <TrendingUp width={16} height={16} />
              ) : (
                <TrendingDown width={16} height={16} />
              )}
            </p>
          </div>
        );
      },
    },
    {
      header: 'Market Cap',
      cellClassName: 'market-cap-cell',
      cell: (category: any) => `$${(category.market_cap || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    },
    {
      header: '24h Volume',
      cellClassName: 'volume-cell',
      cell: (category: any) => `$${(category.volume_24h || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    },
  ];

  // Pre-fill the top hero coin
  const btcItem = trendingCoins.find(c => c.item.binanceSymbol === 'BTCUSDT');
  const coin = btcItem ? {
    id: btcItem.item.id,
    binanceSymbol: "BTCUSDT",
    name: btcItem.item.name,
    symbol: btcItem.item.symbol,
    image: { large: btcItem.item.large },
    market_data: { current_price: { usd: btcItem.item.data.price } }
  } : {
    id: "bitcoin", binanceSymbol: "BTCUSDT", name: "Bitcoin", symbol: "BTC", image: { large: COIN_METADATA["BTCUSDT"].image }, market_data: { current_price: { usd: 64000 } }
  };

  return (
    <main className="main-container">
      {coin && <DashboardClient coin={coin} ohlcData={ohlcData} trendingCoins={trendingCoins} />}
      
      <section className="w-full mt-7 space-y-4">
        {categories && categories.length > 0 && (
          <div id="categories" className="custom-scrollbar">
            <h4>Top Categories</h4>

            <DataTable
              columns={categoryColumns}
              data={categories.slice(0, 10)}
              rowKey={(row: any, i: number) => row.id || i}
              tableClassName="mt-3 w-full"
            />
          </div>
        )}
      </section>
    </main>
  );
}

export default page;
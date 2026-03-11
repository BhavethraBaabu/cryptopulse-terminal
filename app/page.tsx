import React from 'react'
import Image from 'next/image'
import DataTable from './components/DataTable'
import Link from 'next/link';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetcher } from '@/lib/coingecko.actions';

const columns: DataTableColumn<TrendingCoin>[] = [
  {
    header: <span className="bg-transparent border-none text-purple-100 font-medium whitespace-nowrap">Name</span>,
    cellClassName: 'name-cell border-dark-400 py-3 px-6 whitespace-nowrap',
    cell: (coin) => {
      const item = coin.item;

      return (
        <Link href={`/coins/${item.id}`} className="flex flex-col gap-1 items-start">
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
    cell: (coin) => {
      const item = coin.item;
      const change = item.data.price_change_percentage_24h.usd;
      const isTrendingUp = change > 0;

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
    cell: (coin) => {
      const price = coin.item.data.price;
      return (
        <span className="font-medium text-white">
          ${price.toLocaleString(undefined, { minimumFractionDigits: price % 1 === 0 ? 0 : 2, maximumFractionDigits: price % 1 === 0 ? 0 : 2 })}
        </span>
      )
    }
  }
]

const dummyTrendingCoins: TrendingCoin[] = [
  {
    item: {
      id: "bitcoin",
      name: "Bitcoin",
      symbol: "BTC",
      market_cap_rank: 1,
      thumb: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      large: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      data: {
        price: 89113.00,
        price_change_percentage_24h: { usd: 2.4 }
      }
    }
  },
  {
    item: {
      id: "ethereum",
      name: "Ethereum",
      symbol: "ETH",
      market_cap_rank: 2,
      thumb: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      large: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      data: {
        price: 3342.50,
        price_change_percentage_24h: { usd: -1.2 }
      }
    }
  },
  {
    item: {
      id: "tether",
      name: "Tether",
      symbol: "USDT",
      market_cap_rank: 3,
      thumb: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
      large: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
      data: {
        price: 1.00,
        price_change_percentage_24h: { usd: 0.01 }
      }
    }
  },
  {
    item: {
      id: "binancecoin",
      name: "BNB",
      symbol: "BNB",
      market_cap_rank: 4,
      thumb: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
      large: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
      data: {
        price: 612.30,
        price_change_percentage_24h: { usd: 1.8 }
      }
    }
  },
  {
    item: {
      id: "solana",
      name: "Solana",
      symbol: "SOL",
      market_cap_rank: 5,
      thumb: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
      large: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
      data: {
        price: 145.20,
        price_change_percentage_24h: { usd: 5.6 }
      }
    }
  },
  {
    item: {
      id: "ripple",
      name: "XRP",
      symbol: "XRP",
      market_cap_rank: 6,
      thumb: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
      large: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
      data: {
        price: 0.62,
        price_change_percentage_24h: { usd: -0.5 }
      }
    }
  },
  {
    item: {
      id: "usd-coin",
      name: "USDC",
      symbol: "USDC",
      market_cap_rank: 7,
      thumb: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
      large: "https://assets.coingecko.com/coins/images/6319/large/usdc.png",
      data: {
        price: 1.00,
        price_change_percentage_24h: { usd: 0.0 }
      }
    }
  },
  {
    item: {
      id: "staked-ether",
      name: "Lido Staked Ether",
      symbol: "STETH",
      market_cap_rank: 8,
      thumb: "https://assets.coingecko.com/coins/images/13442/large/steth_logo.png",
      large: "https://assets.coingecko.com/coins/images/13442/large/steth_logo.png",
      data: {
        price: 3338.40,
        price_change_percentage_24h: { usd: -1.0 }
      }
    }
  },
  {
    item: {
      id: "dogecoin",
      name: "Dogecoin",
      symbol: "DOGE",
      market_cap_rank: 9,
      thumb: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
      large: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
      data: {
        price: 0.16,
        price_change_percentage_24h: { usd: 4.2 }
      }
    }
  },
  {
    item: {
      id: "cardano",
      name: "Cardano",
      symbol: "ADA",
      market_cap_rank: 10,
      thumb: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
      large: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
      data: {
        price: 0.45,
        price_change_percentage_24h: { usd: 0.8 }
      }
    }
  }
];
const page = async () => {
  const coin = await fetcher<CoinDetailsData>('/coins/bitcoin', {
    dex_pair_format: 'symbol'
  })

  return <main className="main-container flex flex-col gap-8">
    {/*-------------Coin Overview-------------*/}
    <section>
      <div id="coin-overview" className="bg-dark-500 rounded-xl p-5 md:p-6 shadow-sm border border-white/5 w-full">
        <div className="flex gap-4 items-center mb-6">
          <Image src={coin.image.large} alt={coin.name} width={48} height={48} className="rounded-full" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-purple-100/70 mb-1 tracking-wide">{coin.name} / {coin.symbol.toUpperCase()}</span>
            <span className="text-3xl md:text-4xl font-bold text-white">${coin.market_data.current_price.usd.toLocaleString()}</span>

          </div>
        </div>
      </div>
    </section>

    {/*-------------Trending Coins Table-------------*/}
    <section className="w-full space-y-4">
      <h2 className="text-xl font-medium text-white px-1">Trending Coins</h2>
      <div className="bg-dark-500 rounded-xl shadow-sm border border-white/5 overflow-x-auto">
        <DataTable
          data={dummyTrendingCoins}
          columns={columns}
          rowKey={(row) => row.item.id}
          tableClassName="w-full min-w-[600px]"
          headerRowClassName="bg-[#1A202C] border-b border-white/5"
          bodyRowClassName="border-b border-dark-400/50 hover:bg-dark-400/30 transition-colors"
        />
      </div>
    </section>

    {/*-------------Categories-------------*/}
    <section className="w-full mt-7 space-y-4">
      <h2 className="text-xl font-medium text-white px-1">Categories</h2>
      {/* Category content will go here */}
    </section>
  </main>
}

export default page
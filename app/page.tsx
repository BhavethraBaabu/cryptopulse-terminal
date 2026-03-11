import React from 'react'
import Image from 'next/image'
import DataTable from './components/DataTable'
import CandlestickChart from "./components/CandlestickChart";

const columns: DataTableColumn<TrendingCoin>[] = [
  {
    header: 'Name',
    cellClassName: 'name-cell',
    cell: (coin) => {
      const item = coin.item;
      return item?.name || "";
    }
  }
]

const page = () => {
  return (
    <main className="main-container">

      <section className="home-grid">

        {/* Coin Overview */}
        <div id="coin-overview">
          <div className="header">
            <Image
              src="https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
              alt="Bitcoin"
              width={56}
              height={56}
            />

            <div className="coin-info">
              <div className="coin-name">
                <p>Bitcoin / BTC</p>
                <p>$68,981.25</p>
              </div>
            </div>
          </div>

          {/* 👇 MOVE CHART HERE */}
          <section className="w-full mt-6 space-y-3">
            <p className="text-lg font-semibold">Bitcoin Price Chart</p>
            <CandlestickChart />
          </section>

        </div>

        <p>Trending Crypto Coins</p>

      </section>

      {/* Categories Table */}
      <section className="w-full mt-7 space-y-4">
        <p>Categories</p>
        <DataTable
          data={[]}
          columns={columns}
        />
      </section>

    </main>
  )
}
export default page
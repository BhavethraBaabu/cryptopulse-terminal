import Header from "@/components/Header";
import GlobalMarketStats from "@/components/GlobalMarketStats";
import CryptoPriceTable from "@/components/CryptoPriceTable";
import type { Coin } from "@/components/CryptoPriceTable";

async function fetchCoins(): Promise<Coin[]> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchGlobalData() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/global",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Page() {
  const [coins, globalData] = await Promise.all([fetchCoins(), fetchGlobalData()]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-screen-xl px-4 py-6 space-y-6">
        <GlobalMarketStats globalData={globalData} />
        <CryptoPriceTable coins={coins} />
      </main>
    </div>
  );
}
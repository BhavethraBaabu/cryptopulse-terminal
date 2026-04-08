import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Bell } from 'lucide-react';
import { getAlerts, checkAndTriggerAlerts } from '@/app/actions/alerts';
import AlertsClient from './AlertsClient';

export default async function AlertsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Check & trigger any alerts whose price has been crossed
  await checkAndTriggerAlerts();

  const alerts = await getAlerts();

  // Enrich with current prices (batch fetch)
  type PriceMap = Record<string, number>;
  let priceMap: PriceMap = {};

  if (alerts.length > 0) {
    try {
      const symbols = [...new Set(alerts.map((a) => a.coinSymbol))];
      const res = await fetch(
        `https://api.binance.us/api/v3/ticker/price?symbols=${JSON.stringify(symbols)}`,
        { cache: 'no-store' },
      );
      if (res.ok) {
        const data: { symbol: string; price: string }[] = await res.json();
        priceMap = Object.fromEntries(data.map((d) => [d.symbol, parseFloat(d.price)]));
      }
    } catch {}
  }

  const enriched = alerts.map((a) => ({
    ...a,
    currentPrice: priceMap[a.coinSymbol] ?? null,
  }));

  return (
    <main className="main-container" aria-label="Price alerts">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bell className="text-[#adef37]" size={26} aria-hidden="true" />
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">Price Alerts</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Alerts check live prices each time you open this page
          </p>
        </div>
      </div>

      <AlertsClient alerts={enriched} />
    </main>
  );
}

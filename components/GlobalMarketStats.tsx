import { TrendingUp, TrendingDown, DollarSign, BarChart2, Bitcoin, Activity } from "lucide-react";

interface GlobalData {
  data: {
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    market_cap_change_percentage_24h_usd: number;
    active_cryptocurrencies: number;
  };
}

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  trend?: number;
}

function StatCard({ icon, label, value, subValue, trend }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-base font-semibold truncate">{value}</p>
        {trend !== undefined && (
          <p
            className={`text-xs mt-0.5 flex items-center gap-0.5 ${
              trend >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(trend).toFixed(2)}% (24h)
          </p>
        )}
        {subValue && (
          <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>
        )}
      </div>
    </div>
  );
}

interface GlobalMarketStatsProps {
  globalData: GlobalData | null;
}

export default function GlobalMarketStats({ globalData }: GlobalMarketStatsProps) {
  if (!globalData?.data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-lg p-4 h-[80px] animate-pulse"
          />
        ))}
      </div>
    );
  }

  const { data } = globalData;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={<DollarSign className="w-4 h-4" />}
        label="Total Market Cap"
        value={formatLargeNumber(data.total_market_cap.usd)}
        trend={data.market_cap_change_percentage_24h_usd}
      />
      <StatCard
        icon={<BarChart2 className="w-4 h-4" />}
        label="24h Volume"
        value={formatLargeNumber(data.total_volume.usd)}
        subValue="Trading volume"
      />
      <StatCard
        icon={<Bitcoin className="w-4 h-4" />}
        label="BTC Dominance"
        value={`${data.market_cap_percentage.btc.toFixed(1)}%`}
        subValue={`ETH: ${data.market_cap_percentage.eth.toFixed(1)}%`}
      />
      <StatCard
        icon={<Activity className="w-4 h-4" />}
        label="Active Cryptos"
        value={data.active_cryptocurrencies.toLocaleString()}
        subValue="Listed coins"
      />
    </div>
  );
}

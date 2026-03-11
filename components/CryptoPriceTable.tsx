"use client";

import { useState, useMemo } from "react";
import { Search, TrendingUp, TrendingDown, ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_24h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  circulating_supply: number;
}

type SortKey = keyof Pick<
  Coin,
  | "market_cap_rank"
  | "current_price"
  | "price_change_percentage_1h_in_currency"
  | "price_change_percentage_24h_in_currency"
  | "price_change_percentage_7d_in_currency"
  | "market_cap"
  | "total_volume"
>;

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 8 })}`;
}

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

function PriceChange({ value }: { value: number | null }) {
  if (value == null || isNaN(value)) {
    return <span className="text-muted-foreground">—</span>;
  }
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 font-medium ${
        isPositive ? "text-green-500" : "text-red-500"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}

interface SortIconProps {
  column: SortKey;
  currentSort: SortKey;
  direction: "asc" | "desc";
}

function SortIcon({ column, currentSort, direction }: SortIconProps) {
  if (column !== currentSort) {
    return <ChevronUp className="w-3 h-3 text-muted-foreground/40" />;
  }
  return direction === "asc" ? (
    <ChevronUp className="w-3 h-3 text-foreground" />
  ) : (
    <ChevronDown className="w-3 h-3 text-foreground" />
  );
}

interface CryptoPriceTableProps {
  coins: Coin[];
}

export default function CryptoPriceTable({ coins }: CryptoPriceTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("market_cap_rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "market_cap_rank" ? "asc" : "desc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const result = q
      ? coins.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.symbol.toLowerCase().includes(q)
        )
      : coins;

    return [...result].sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [coins, search, sortKey, sortDir]);

  const columns: { key: SortKey; label: string; align: "left" | "right" }[] = [
    { key: "market_cap_rank", label: "#", align: "left" },
    { key: "current_price", label: "Price", align: "right" },
    { key: "price_change_percentage_1h_in_currency", label: "1h %", align: "right" },
    { key: "price_change_percentage_24h_in_currency", label: "24h %", align: "right" },
    { key: "price_change_percentage_7d_in_currency", label: "7d %", align: "right" },
    { key: "market_cap", label: "Market Cap", align: "right" },
    { key: "total_volume", label: "Volume (24h)", align: "right" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold">Market Overview</h2>
        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search coins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border border-border rounded-md outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs">
              {columns.map(({ key, label, align }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`px-4 py-2.5 font-medium cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap ${
                    align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {align === "right" && (
                      <SortIcon column={key} currentSort={sortKey} direction={sortDir} />
                    )}
                    {label}
                    {align === "left" && (
                      <SortIcon column={key} currentSort={sortKey} direction={sortDir} />
                    )}
                  </span>
                </th>
              ))}
              <th className="px-4 py-2.5 font-medium text-left whitespace-nowrap">
                Name
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-muted-foreground text-sm"
                >
                  No coins found matching &quot;{search}&quot;
                </td>
              </tr>
            ) : (
              filtered.map((coin) => (
                <tr
                  key={coin.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-muted-foreground font-mono">
                    {coin.market_cap_rank}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium">
                    {formatPrice(coin.current_price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PriceChange value={coin.price_change_percentage_1h_in_currency} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PriceChange value={coin.price_change_percentage_24h_in_currency} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <PriceChange value={coin.price_change_percentage_7d_in_currency} />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                    {formatLargeNumber(coin.market_cap)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                    {formatLargeNumber(coin.total_volume)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={coin.image}
                        alt={coin.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                        unoptimized
                      />
                      <div>
                        <p className="font-medium leading-none">{coin.name}</p>
                        <p className="text-xs text-muted-foreground uppercase mt-0.5">
                          {coin.symbol}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-2.5 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
        <span>
          Showing {filtered.length} of {coins.length} coins
        </span>
        <span>Data provided by CoinGecko</span>
      </div>
    </div>
  );
}

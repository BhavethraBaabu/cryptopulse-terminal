"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchBinanceKlines } from "@/lib/binance.actions";

// ─── Types ─────────────────────────────────────────────────────────────────────

type DataPoint = { time: number; price: number; isNew?: boolean };

type Timeframe = "1M" | "1H" | "1D" | "1Mo" | "1Y";

interface TFConfig {
  label: Timeframe;
  title: string;
  binanceInterval: string;
  binanceLimit: number;
  live: boolean; // WebSocket streaming mode
}

const TIMEFRAMES: TFConfig[] = [
  { label: "1M",  title: "1 Min",   binanceInterval: "1m",  binanceLimit: 60,  live: true  },
  { label: "1H",  title: "1 Hour",  binanceInterval: "1m",  binanceLimit: 60,  live: false },
  { label: "1D",  title: "1 Day",   binanceInterval: "1h",  binanceLimit: 24,  live: false },
  { label: "1Mo", title: "1 Month", binanceInterval: "1d",  binanceLimit: 30,  live: false },
  { label: "1Y",  title: "1 Year",  binanceInterval: "1w",  binanceLimit: 52,  live: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (n >= 1)    return `$${n.toFixed(4)}`;
  return `$${n.toFixed(6)}`;
}

function fmtAxis(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  if (n >= 1)    return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

function fmtTime(ts: number, tf: Timeframe) {
  const d = new Date(ts);
  if (tf === "1M" || tf === "1H")
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (tf === "1D")
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function fmtTooltipTime(ts: number, tf: Timeframe) {
  const d = new Date(ts);
  if (tf === "1M") return d.toLocaleTimeString();
  if (tf === "1H" || tf === "1D")
    return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
}

const gridColor = "rgba(255,255,255,0.05)";

function makeInitialData(basePrice: number, n = 30): DataPoint[] {
  let price = basePrice;
  return Array.from({ length: n }, (_, i) => {
    price = price * (1 + (Math.random() - 0.5) * 0.002);
    return { time: Date.now() - (n - 1 - i) * 2000, price };
  });
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, tf }: { active?: boolean; payload?: any; tf: Timeframe }) {
  if (!active || !payload?.length) return null;
  const { time, price } = payload[0]?.payload ?? {};
  return (
    <div className="rounded-xl border border-white/15 bg-black/80 px-3 py-2 text-xs shadow-xl backdrop-blur-lg">
      <p className="text-gray-400">{fmtTooltipTime(time, tf)}</p>
      <p className="font-semibold text-white mt-0.5">{fmtPrice(price)}</p>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  coinSymbol: string;   // e.g. "BTC"
  coinName: string;
  coinImage?: string;
  currentPrice: number;
  className?: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GlassCoinChart({ coinSymbol, coinName, coinImage, currentPrice, className = "" }: Props) {
  const [tf, setTf] = useState<Timeframe>("1H");
  const [chartType, setChartType] = useState<"area" | "line">("area");
  const [data, setData] = useState<DataPoint[]>(() => makeInitialData(currentPrice));
  const [loading, setLoading] = useState(false);
  const [wsStatus, setWsStatus] = useState<"live" | "polling" | "connecting">("connecting");

  const wsRef  = useRef<WebSocket | null>(null);
  const pollRef = useRef<number | null>(null);

  const binanceSymbol = `${coinSymbol.toUpperCase().replace("USDT", "")}USDT`;
  const coinbaseId    = `${coinSymbol.toUpperCase().replace("USDT", "")}-USD`;

  // Derived stats
  const latestPrice = data[data.length - 1]?.price ?? currentPrice;
  const firstPrice  = data[0]?.price ?? latestPrice;
  const change      = latestPrice - firstPrice;
  const changePct   = firstPrice ? (change / firstPrice) * 100 : 0;
  const isUp        = change >= 0;
  const strokeColor = isUp ? "#adef37" : "#ef4444";

  // ── Stop all connections ───────────────────────────────────────────────────
  const stopAll = useCallback(() => {
    if (wsRef.current) { try { wsRef.current.close(); } catch {} wsRef.current = null; }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  // ── Push a live tick ──────────────────────────────────────────────────────
  const pushTick = useCallback((price: number) => {
    setData(prev => {
      const updated = prev.map(p => ({ ...p, isNew: false }));
      // In live mode keep last 90 seconds of ticks
      const cutoff = Date.now() - 90_000;
      const trimmed = updated.filter(p => p.time > cutoff);
      return [...trimmed, { time: Date.now(), price, isNew: true }];
    });
  }, []);

  // ── Start Coinbase WebSocket (live 1M mode) ───────────────────────────────
  const startWs = useCallback(() => {
    stopAll();
    setWsStatus("connecting");

    const ws = new WebSocket("wss://ws-feed.exchange.coinbase.com");
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus("live");
      ws.send(JSON.stringify({ type: "subscribe", product_ids: [coinbaseId], channels: ["ticker"] }));
    };
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "ticker" && msg.price) {
          const p = parseFloat(msg.price);
          if (!isNaN(p)) pushTick(p);
        }
      } catch {}
    };
    ws.onerror = () => setWsStatus("polling");
    ws.onclose = () => {
      setWsStatus("polling");
      startBinancePolling();
    };
  }, [coinbaseId, pushTick, stopAll]);

  // ── Fallback: poll Binance ticker every 2s ────────────────────────────────
  const startBinancePolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }

    const fetch1 = async () => {
      try {
        const res = await fetch(`https://api.binance.us/api/v3/ticker/price?symbol=${binanceSymbol}`, { cache: "no-store" });
        if (!res.ok) return;
        const { price } = await res.json();
        const p = parseFloat(price);
        if (!isNaN(p)) pushTick(p);
      } catch {}
    };

    fetch1();
    pollRef.current = window.setInterval(fetch1, 2000);
  }, [binanceSymbol, pushTick]);

  // ── Load historical klines ────────────────────────────────────────────────
  const loadKlines = useCallback(async (config: TFConfig) => {
    setLoading(true);
    try {
      const raw = await fetchBinanceKlines(binanceSymbol, config.binanceInterval, config.binanceLimit);
      if (Array.isArray(raw) && raw.length > 0) {
        setData(raw.map((k: any[]) => ({ time: k[0], price: parseFloat(k[4]) })));
      }
    } catch {}
    setLoading(false);
  }, [binanceSymbol]);

  // ── React to timeframe change ─────────────────────────────────────────────
  useEffect(() => {
    const config = TIMEFRAMES.find(t => t.label === tf)!;

    if (config.live) {
      // Live streaming mode
      setData(makeInitialData(currentPrice, 5));
      startWs();
    } else {
      // Historical mode
      stopAll();
      setWsStatus("connecting");
      loadKlines(config);
    }

    return () => stopAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tf, coinbaseId, binanceSymbol]);

  // ── Passively keep latest price on non-live tabs ──────────────────────────
  useEffect(() => {
    const config = TIMEFRAMES.find(t => t.label === tf)!;
    if (config.live) return; // handled by WS
    if (!currentPrice) return;
    setData(prev => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      if (last.price === currentPrice) return prev;
      return [...prev.slice(0, -1), { ...last, price: currentPrice }];
    });
  }, [currentPrice, tf]);

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload?.isNew) return null;
    return <circle cx={cx} cy={cy} r={4} fill={strokeColor} className="animate-pulse" />;
  };

  const tickFormatter = (v: number) => fmtTime(v, tf);
  const yFormatter    = (v: number) => fmtAxis(v);

  return (
    <div
      className={`relative rounded-2xl border border-white/8 overflow-hidden ${className}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Glow blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: isUp ? "rgba(173,239,55,0.08)" : "rgba(239,68,68,0.08)" }} />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-400/5 blur-3xl" />
      </div>

      <div className="relative z-10 p-5 sm:p-6">

        {/* ── Header row ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          {/* Coin info + price */}
          <div className="flex items-center gap-3">
            {coinImage && (
              <Image src={coinImage} alt={coinName} width={40} height={40} className="rounded-full shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg">{coinName}</span>
                <span className="text-xs text-gray-500 uppercase">{coinSymbol.replace("USDT", "")}/USDT</span>
                {tf === "1M" && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                    style={
                      wsStatus === "live"
                        ? { color: "#adef37", borderColor: "#adef3740", background: "#adef3710" }
                        : wsStatus === "polling"
                        ? { color: "#facc15", borderColor: "#facc1540", background: "#facc1510" }
                        : { color: "#9ca3af", borderColor: "#ffffff20", background: "transparent" }
                    }
                  >
                    {wsStatus === "live" ? "● LIVE" : wsStatus === "polling" ? "◉ POLLING" : "◌ …"}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold text-white tabular-nums">{fmtPrice(latestPrice)}</span>
                <span className={`text-sm font-semibold ${isUp ? "text-[#adef37]" : "text-red-400"}`}>
                  {isUp ? "▲" : "▼"} {Math.abs(changePct).toFixed(2)}%
                </span>
                <span className={`text-xs ${isUp ? "text-[#adef37]/70" : "text-red-400/70"}`}>
                  ({isUp ? "+" : ""}{fmtPrice(Math.abs(change))})
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Timeframe buttons */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-0.5">
              {TIMEFRAMES.map(({ label, title }) => (
                <button
                  key={label}
                  onClick={() => setTf(label)}
                  title={title}
                  className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                    tf === label
                      ? "bg-[#adef37] text-black shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Chart type */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-0.5">
              {(["area", "line"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-semibold capitalize transition-all ${
                    chartType === t ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Chart ── */}
        <div
          className="relative h-[300px] sm:h-[380px] rounded-xl border border-white/6 p-2"
          style={{ background: "rgba(0,0,0,0.25)" }}
        >
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="animate-spin h-4 w-4 text-[#adef37]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading {tf} data…
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${coinSymbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={strokeColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis
                  dataKey="time"
                  tickFormatter={tickFormatter}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={60}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tickFormatter={yFormatter}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  orientation="right"
                />
                <ReTooltip content={(props) => <ChartTooltip {...props} tf={tf} />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={strokeColor}
                  fill={`url(#grad-${coinSymbol})`}
                  strokeWidth={2}
                  dot={(p) => <CustomDot {...p} />}
                  isAnimationActive={false}
                />
              </AreaChart>
            ) : (
              <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis
                  dataKey="time"
                  tickFormatter={tickFormatter}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={60}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tickFormatter={yFormatter}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  orientation="right"
                />
                <ReTooltip content={(props) => <ChartTooltip {...props} tf={tf} />} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={strokeColor}
                  strokeWidth={2}
                  dot={(p) => <CustomDot {...p} />}
                  isAnimationActive={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* ── Footer ── */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-gray-600">
          <span>
            {tf === "1M"
              ? wsStatus === "live"
                ? "Streaming · Coinbase WebSocket"
                : "Streaming · Binance REST fallback"
              : `Historical · Binance klines (${TIMEFRAMES.find(t => t.label === tf)?.binanceInterval} intervals)`}
          </span>
          <span>{data.length} data points</span>
        </div>
      </div>
    </div>
  );
}

"use client"

import React, { useEffect, useRef, useState } from "react"
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
} from "recharts"
import CandlestickChart from "../CandlestickChart"

type DataPoint = { time: string; price: number; isNew: boolean }
type Product = { coin: string; fiat: string }

const formatTime = (time: string) =>
  new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })

const makeInitialData = (base = 100, n = 20): DataPoint[] =>
  Array.from({ length: n }, (_, i) => ({
    time: new Date(Date.now() - (n - 1 - i) * 1000).toISOString(),
    price: base + Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1),
    isNew: false,
  }))

const toCoinbaseProductId = ({ coin, fiat }: Product) =>
  `${coin.toUpperCase()}-${fiat.toUpperCase()}`

const SUPPORTED_COINS = ["BTC", "ETH", "SOL", "XRP", "ADA", "DOGE", "BNB"]
const SUPPORTED_FIATS = ["USD"]

const upColor = "#adef37"
const downColor = "#ef4444"
const gridColor = "rgba(255,255,255,0.06)"

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: any; label?: string }) {
  if (!active || !payload?.length) return null
  const p = payload[0]?.value as number
  return (
    <div className="rounded-xl border border-white/20 bg-black/70 px-3 py-2 text-xs text-gray-100 shadow-xl backdrop-blur-lg">
      <div className="font-medium text-gray-400">{formatTime(label || "")}</div>
      <div className="font-semibold text-white mt-0.5">${p?.toFixed(2)}</div>
    </div>
  )
}

export default function RealTimeGlassChart() {
  const [isRunning, setIsRunning] = useState(true)
  const [chartType, setChartType] = useState<"line" | "area" | "candle">("area")
  const [product, setProduct] = useState<Product>({ coin: "BTC", fiat: "USD" })
  const [data, setData] = useState<DataPoint[]>(makeInitialData(83000))
  const [wsStatus, setWsStatus] = useState<"connected" | "disconnected" | "connecting">("connecting")
  const wsRef = useRef<WebSocket | null>(null)
  const pollingRef = useRef<number | null>(null)

  const latestPrice = data[data.length - 1]?.price || 0
  const previousPrice = data[data.length - 2]?.price || latestPrice
  const priceChange = latestPrice - previousPrice
  const percentChange = previousPrice ? (priceChange / previousPrice) * 100 : 0
  const isPriceUp = priceChange >= 0

  const pushPoint = (price: number) => {
    setData((curr) => {
      const updated = curr.map((p) => ({ ...p, isNew: false }))
      return [...updated.slice(Math.max(0, updated.length - 29)), { time: new Date().toISOString(), price, isNew: true }]
    })
  }

  const startBinancePolling = (prod: Product, onPrice: (p: number) => void) => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
    const symbol = `${prod.coin.toUpperCase()}USDT`
    const fetchPrice = async () => {
      try {
        const res = await fetch(`https://api.binance.us/api/v3/ticker/price?symbol=${symbol}`)
        if (!res.ok) return
        const json = await res.json()
        const price = parseFloat(json.price)
        if (!Number.isNaN(price)) onPrice(price)
      } catch {}
    }
    fetchPrice()
    pollingRef.current = window.setInterval(fetchPrice, 3000)
  }

  useEffect(() => {
    if (!isRunning) {
      wsRef.current?.close(); wsRef.current = null
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
      return
    }
    wsRef.current?.close(); wsRef.current = null
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }

    const productId = toCoinbaseProductId(product)
    const ws = new WebSocket("wss://ws-feed.exchange.coinbase.com")
    wsRef.current = ws
    setWsStatus("connecting")

    ws.onopen = () => {
      setWsStatus("connected")
      ws.send(JSON.stringify({ type: "subscribe", product_ids: [productId], channels: ["ticker"] }))
    }
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload?.type === "ticker" && payload?.price) {
          const p = parseFloat(payload.price)
          if (!Number.isNaN(p)) pushPoint(p)
        }
      } catch {}
    }
    ws.onerror = () => setWsStatus("disconnected")
    ws.onclose = () => { setWsStatus("disconnected"); startBinancePolling(product, pushPoint) }

    return () => {
      ws.close(); wsRef.current = null
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.coin, product.fiat, isRunning])

  useEffect(() => {
    setData(makeInitialData(latestPrice || 100))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.coin, product.fiat])

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props
    if (!payload?.isNew) return null
    return <circle cx={cx} cy={cy} r={5} fill={isPriceUp ? upColor : downColor} className="animate-pulse" />
  }
  const CustomActiveDot = (props: any) => {
    const { cx, cy } = props
    return <circle cx={cx} cy={cy} r={5} fill={isPriceUp ? upColor : downColor} stroke="white" strokeWidth={1.5} />
  }

  const strokeColor = isPriceUp ? upColor : downColor

  return (
    <div
      className="relative rounded-2xl border border-white/8 overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Decorative glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-[#adef37]/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-cyan-400/8 blur-3xl" />
      </div>

      <div className="relative z-10 p-5 sm:p-6">
        {/* Top row: title + controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{product.coin}/{product.fiat}</span>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                style={
                  wsStatus === "connected"
                    ? { color: "#adef37", borderColor: "#adef3740", background: "#adef3710" }
                    : { color: "#9ca3af", borderColor: "#ffffff20", background: "transparent" }
                }
              >
                {wsStatus === "connected" ? "● LIVE" : wsStatus === "connecting" ? "◌ Connecting" : "○ Polling"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Coinbase WebSocket · Binance fallback</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Coin selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Coin</label>
              <select
                value={product.coin}
                onChange={(e) => setProduct((p) => ({ ...p, coin: e.target.value }))}
                className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#adef37]/40"
              >
                {SUPPORTED_COINS.map((c) => <option key={c} value={c} className="bg-[#0b0f17]">{c}</option>)}
              </select>
            </div>

            {/* Fiat selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Fiat</label>
              <select
                value={product.fiat}
                onChange={(e) => setProduct((p) => ({ ...p, fiat: e.target.value }))}
                className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-[#adef37]/40"
              >
                {SUPPORTED_FIATS.map((f) => <option key={f} value={f} className="bg-[#0b0f17]">{f}</option>)}
              </select>
            </div>

            {/* Chart type */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Type</label>
              <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5">
                {(["area", "line", "candle"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setChartType(t)}
                    className={`px-2.5 py-1 text-xs rounded-md capitalize transition-all ${
                      chartType === t ? "bg-[#adef37] text-black font-semibold" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Live toggle */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">Live</label>
              <button
                onClick={() => setIsRunning((v) => !v)}
                className={`relative h-6 w-11 rounded-full transition-colors ${isRunning ? "bg-[#adef37]" : "bg-gray-600"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${isRunning ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Price ticker */}
        <div className="mb-5">
          <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
            ${latestPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`mt-1 flex items-center gap-1 text-sm font-semibold ${isPriceUp ? "text-[#adef37]" : "text-red-400"}`}>
            <span>{isPriceUp ? "▲" : "▼"}</span>
            <span>${Math.abs(priceChange).toFixed(2)}</span>
            <span className="text-xs font-medium opacity-80">({percentChange >= 0 ? "+" : ""}{percentChange.toFixed(3)}%)</span>
          </div>
        </div>

        {/* Chart */}
        <div
          className="h-[280px] sm:h-[340px] rounded-xl border border-white/6 p-2 relative"
          style={{ background: "rgba(0,0,0,0.2)" }}
        >
          {chartType === "candle" ? (
            <div className="absolute inset-0 pt-0 pb-6 px-1">
              <CandlestickChart coinSymbol={product.coin} currentPrice={latestPrice} className="w-full h-full min-h-0">
                <div className="hidden" />
              </CandlestickChart>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="time" tickFormatter={formatTime} tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} width={60} />
                <ReTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="price" stroke={strokeColor} strokeWidth={2} dot={(p) => <CustomDot {...p} />} activeDot={(p) => <CustomActiveDot {...p} />} isAnimationActive={false} />
              </LineChart>
            ) : (
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strokeColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="time" tickFormatter={formatTime} tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} width={60} />
                <ReTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="price" stroke={strokeColor} fill="url(#priceGradient)" strokeWidth={2} dot={(p) => <CustomDot {...p} />} activeDot={(p) => <CustomActiveDot {...p} />} isAnimationActive={false} />
              </AreaChart>
            )}
          </ResponsiveContainer>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-gray-600">
          <span>Data: Coinbase WS · Binance fallback</span>
          <span>Updates every tick</span>
        </div>
      </div>
    </div>
  )
}

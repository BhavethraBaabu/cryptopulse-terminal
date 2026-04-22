'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, useInView } from 'framer-motion';
import {
  Zap,
  TrendingUp,
  Bell,
  Wallet,
  BarChart2,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Star,
  UserCircle2,
  LineChart,
} from 'lucide-react';

const RealTimeGlassChart = dynamic(() => import('./ui/glass-real-time-crypto-chart'), { ssr: false });

/* ─────────── types ─────────── */
interface TickerCoin {
  symbol: string;
  id: string;
  name: string;
  price: number;
  change: number;
  image: string;
}

interface LandingPageProps {
  tickers: TickerCoin[];
}

/* ─────────── sparkline SVG ─────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 120;
  const h = 40;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="1.8" points={pts} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────── static sparklines ─────────── */
const UP_LINE = [30, 28, 32, 29, 35, 33, 38, 36, 40, 38, 44, 42, 47, 45, 50];
const DOWN_LINE = [50, 48, 45, 47, 43, 40, 38, 36, 34, 37, 33, 30, 28, 26, 24];
const FLAT_LINE = [30, 32, 29, 33, 31, 34, 30, 32, 35, 31, 33, 30, 32, 34, 31];

/* ─────────── section fade wrapper ─────────── */
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */
export default function LandingPage({ tickers }: LandingPageProps) {
  return (
    <div className="relative overflow-hidden bg-[#000510]">
      {/* ── ambient gradient blobs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#adef37]/5 blur-[120px]" />
        <div className="absolute top-1/3 -right-60 w-[500px] h-[500px] rounded-full bg-purple-700/8 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-700/6 blur-[100px]" />
      </div>

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative z-10 px-4 sm:px-6 pt-20 pb-12 md:pt-28 md:pb-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#adef37]/30 bg-[#adef37]/8 text-[#adef37] text-xs font-semibold uppercase tracking-wider mb-5">
                <Activity className="w-3 h-3" />
                Live Market Data
              </span>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight text-white">
                Track, Trade &amp;{' '}
                <span className="bg-gradient-to-r from-[#adef37] via-[#76da44] to-emerald-400 bg-clip-text text-transparent">
                  Grow
                </span>{' '}
                Your Crypto Portfolio
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-[#a3aed0] leading-relaxed max-w-lg"
            >
              Real-time Binance charts, AI-powered insights from Claude, price alerts, and practice trading with $100K virtual funds — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/coins"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#adef37] text-black font-semibold rounded-xl hover:bg-[#adef37]/90 transition-all shadow-lg shadow-[#adef37]/20 text-sm"
              >
                Explore Markets
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/5 transition-all text-sm"
              >
                Try Practice Trading
              </Link>
            </motion.div>
          </div>

          {/* Right – BTC live price card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md">
              {/* primary card — real BTC price from props */}
              <div
                className="rounded-2xl p-5 border border-white/8"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Image
                    src="https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
                    alt="Bitcoin"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-white text-sm">Bitcoin</p>
                    <p className="text-xs text-[#a3aed0] uppercase">BTC / USDT · Live</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-bold text-white text-base">
                      ${tickers[0]?.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) ?? '83,500'}
                    </p>
                    <p className={`text-xs font-medium flex items-center justify-end gap-0.5 ${(tickers[0]?.change ?? 1) >= 0 ? 'text-[#76da44]' : 'text-red-400'}`}>
                      {(tickers[0]?.change ?? 1) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(tickers[0]?.change ?? 1).toFixed(2)}% 24h
                    </p>
                  </div>
                </div>
                <Sparkline data={UP_LINE} color="#adef37" />
                <div className="flex justify-between mt-3 text-xs text-[#a3aed0]">
                  <span>1m</span><span>5m</span><span>15m</span><span className="text-[#adef37] font-semibold">1h</span><span>1d</span>
                </div>
              </div>

              {/* live data source tag */}
              <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-[#a3aed0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#adef37] animate-pulse" />
                Live prices via Binance API · refreshes every 60s
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── live ticker strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-16 rounded-2xl border border-white/6 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-white/6">
            {tickers.map((coin) => (
              <Link
                key={coin.symbol}
                href={`/coins/${coin.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/4 transition-colors group"
              >
                <Image src={coin.image} alt={coin.name} width={28} height={28} className="rounded-full" />
                <div className="min-w-0">
                  <p className="text-xs text-[#a3aed0] font-medium truncate">{coin.name}</p>
                  <p className="text-white text-sm font-semibold truncate">
                    ${coin.price.toLocaleString('en-US', { maximumFractionDigits: coin.price < 1 ? 4 : 0 })}
                  </p>
                </div>
                <p
                  className={`ml-auto text-xs font-medium flex items-center gap-0.5 whitespace-nowrap ${
                    coin.change >= 0 ? 'text-[#76da44]' : 'text-red-400'
                  }`}
                >
                  {coin.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(coin.change).toFixed(2)}%
                </p>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════ LIVE CHART ══════════════ */}
      <section className="relative z-10 px-4 sm:px-6 pb-4 max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#adef37]/30 bg-[#adef37]/8 text-[#adef37] text-xs font-semibold uppercase tracking-wider">
              <Activity className="w-3 h-3" /> Live Prices
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mt-3">Real-Time Crypto Chart</h2>
            <p className="mt-2 text-sm text-[#a3aed0] max-w-md mx-auto">
              Switch between BTC, ETH, SOL and more — streaming live via Coinbase WebSocket.
            </p>
          </div>
          <RealTimeGlassChart />
        </FadeIn>
      </section>

      {/* ══════════════ HONEST STATS ══════════════ */}
      <section className="relative z-10 px-4 sm:px-6 py-10 max-w-7xl mx-auto">
        <FadeIn>
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/6"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            {[
              { icon: LineChart, label: 'Tradeable coins', value: '10', sub: 'in practice mode' },
              { icon: Wallet, label: 'Virtual capital', value: '$100,000', sub: 'to start with' },
              { icon: Activity, label: 'Live-priced coins', value: '5', sub: 'on home ticker' },
              { icon: Sparkles, label: 'AI analysis', value: 'Claude', sub: 'by Anthropic' },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center py-8 px-4 gap-1 text-center"
                style={{ background: 'rgba(0,5,16,0.6)', backdropFilter: 'blur(8px)' }}
              >
                <Icon className="w-5 h-5 text-[#adef37] mb-2" />
                <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
                <p className="text-xs text-white font-medium">{label}</p>
                <p className="text-xs text-[#a3aed0]">{sub}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className="relative z-10 px-4 sm:px-6 py-16 max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/8 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <Zap className="w-3 h-3" /> Get started in minutes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">How it works</h2>
            <p className="mt-3 text-[#a3aed0] max-w-xl mx-auto">
              No setup required. Sign in and you're ready to explore.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: UserCircle2,
              color: '#adef37',
              title: 'Create a free account',
              desc: 'Sign up with your email via Clerk Auth. No credit card, no trial period — just sign in and go.',
            },
            {
              step: '02',
              icon: LineChart,
              color: '#38bdf8',
              title: 'Explore live markets',
              desc: 'Browse thousands of coins, view real-time candlestick charts from Binance, and star the ones you want to watch.',
            },
            {
              step: '03',
              icon: TrendingUp,
              color: '#a78bfa',
              title: 'Track, alert & practise',
              desc: 'Log your holdings, set price alerts, and test your strategies with $100,000 in virtual USDT before risking real money.',
            },
          ].map(({ step, icon: Icon, color, title, desc }, i) => (
            <FadeIn key={step} delay={i * 0.1}>
              <div
                className="relative rounded-2xl p-6 border border-white/6 h-full"
                style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)' }}
              >
                <span
                  className="absolute top-5 right-5 text-5xl font-black opacity-8 leading-none select-none"
                  style={{ color }}
                >
                  {step}
                </span>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#a3aed0] leading-relaxed">{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section className="relative z-10 px-4 sm:px-6 py-16 max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/8 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3 h-3" /> What's inside
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Six tools, one platform
            </h2>
            <p className="mt-3 text-[#a3aed0] max-w-xl mx-auto">
              Everything is built and working — click any card to go straight to that feature.
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: BarChart2,
              color: '#adef37',
              title: 'Live Price Charts',
              desc: 'Candlestick and line charts driven by real Binance data. Switch between 1m, 5m, 15m, 1h, and 1d timeframes on any coin.',
              sparkData: UP_LINE,
              href: '/coins',
            },
            {
              icon: Wallet,
              color: '#2ebe7b',
              title: 'Portfolio Tracker',
              desc: 'Add your holdings by coin and quantity. See live P&L, an allocation breakdown chart, and total portfolio value updated in real time.',
              sparkData: FLAT_LINE,
              href: '/portfolio',
            },
            {
              icon: Bell,
              color: '#facc15',
              title: 'Price Alerts',
              desc: 'Set a target price for any coin. Each time you open the alerts page, live Binance prices are checked and triggered alerts are flagged.',
              sparkData: UP_LINE,
              href: '/alerts',
            },

            {
              icon: TrendingUp,
              color: '#38bdf8',
              title: 'Practice Trading',
              desc: 'Start with $100,000 virtual USDT. Buy and sell 10 real coins at live Binance prices, track unrealised P&L, and reset your wallet anytime.',
              sparkData: DOWN_LINE,
              href: '/practice',
            },
            {
              icon: Star,
              color: '#fb923c',
              title: 'Watchlist',
              desc: 'Star any coin from the markets page and find it in your watchlist with live price and 24h change. One click to view the full chart.',
              sparkData: UP_LINE,
              href: '/watchlist',
            },
          ].map(({ icon: Icon, color, title, desc, sparkData, href }, i) => (
            <FadeIn key={title} delay={i * 0.07}>
              <Link href={href} className="group block h-full">
                <div
                  className="h-full rounded-2xl p-5 border border-white/6 hover:border-white/12 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-base group-hover:text-[#adef37] transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-[#a3aed0] leading-relaxed mb-4">{desc}</p>
                  <Sparkline data={sparkData} color={color} />
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="relative z-10 px-4 sm:px-6 py-20 max-w-7xl mx-auto">
        <FadeIn>
          <div
            className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center border border-white/8"
            style={{
              background: 'linear-gradient(135deg, rgba(173,239,55,0.07) 0%, rgba(46,190,123,0.05) 50%, rgba(167,139,250,0.06) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* bg grid */}
            <div
              className="pointer-events-none absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <h2 className="relative text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Ready to explore the{' '}
              <span className="text-[#adef37]">crypto market?</span>
            </h2>
            <p className="relative text-lg text-[#a3aed0] mb-8 max-w-xl mx-auto">
              Markets, portfolio tracking, price alerts, AI insights, and practice trading — all free, no credit card needed.
            </p>
            <div className="relative flex flex-wrap justify-center gap-4">
              <Link
                href="/coins"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#adef37] text-black font-bold rounded-xl hover:bg-[#adef37]/90 transition-all shadow-xl shadow-[#adef37]/20 text-base"
              >
                Explore Markets
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 px-8 py-4 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/5 transition-all text-base"
              >
                Practice Trading
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="relative z-10 border-t border-white/6 px-4 sm:px-6 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="CoinPulse" width={100} height={30} />
            <span className="text-xs text-[#a3aed0]">© 2025 CoinPulse. Capstone project.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#a3aed0]">
            <Activity className="w-3.5 h-3.5 text-[#adef37]" />
            Powered by Binance API &amp; Claude AI
          </div>
        </div>
      </footer>
    </div>
  );
}

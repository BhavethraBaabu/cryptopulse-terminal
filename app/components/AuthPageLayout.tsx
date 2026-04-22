'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  BarChart2,
  Wallet,
  Bell,
  Sparkles,
  TrendingUp,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';

/* ── tiny sparkline ── */
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80;
  const h = 28;
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
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-7" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="1.6" points={pts} strokeLinecap="round" />
    </svg>
  );
}

const BTC_LINE = [30, 28, 33, 31, 36, 34, 39, 37, 42, 40, 45, 44, 48, 46, 50];
const ETH_LINE = [40, 38, 35, 37, 33, 31, 34, 30, 28, 32, 29, 26, 30, 28, 25];

/* ── stagger container ── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

/* ── floating card wrapper ── */
function FloatCard({
  children,
  delay,
  className,
  amplitude = 8,
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
  amplitude?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -amplitude, 0] }}
      transition={{ duration: 3.5 + delay * 0.4, repeat: Infinity, ease: 'easeInOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ════════════════════════════════════════ */
interface AuthPageLayoutProps {
  heading: string;
  subtext: React.ReactNode;
  features: { icon: React.ElementType; label: string; color: string }[];
  children: React.ReactNode;
}

export default function AuthPageLayout({
  heading,
  subtext,
  features,
  children,
}: AuthPageLayoutProps) {
  const leftRef = useRef(null);
  const leftInView = useInView(leftRef, { once: true });

  return (
    <div className="min-h-screen bg-[#000510] flex overflow-hidden">
      {/* ══════ LEFT BRAND PANEL ══════ */}
      <div
        ref={leftRef}
        className="hidden lg:flex flex-col justify-between w-[460px] xl:w-[520px] relative overflow-hidden border-r border-white/5 p-10 xl:p-14"
      >
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#adef37]/6 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-purple-700/10 blur-[90px]" />
          <div className="absolute top-1/2 left-1/4 w-[200px] h-[200px] rounded-full bg-cyan-700/6 blur-[80px]" />
        </div>

        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* ── Logo ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={leftInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <Link href="/">
            <Image src="/logo.svg" alt="CoinPulse" width={120} height={36} priority />
          </Link>
        </motion.div>

        {/* ── Heading & features ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={leftInView ? 'visible' : 'hidden'}
          className="space-y-8 my-auto"
        >
          <motion.div variants={itemVariants} className="space-y-3">
            <motion.span
              variants={itemVariants}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#adef37]/30 bg-[#adef37]/8 text-[#adef37] text-xs font-semibold uppercase tracking-wider"
            >
              <Activity className="w-3 h-3" />
              Live Market Data
            </motion.span>
            <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
              {heading}
            </h2>
            <p className="text-[#a3aed0] leading-relaxed">{subtext}</p>
          </motion.div>

          {/* Feature list */}
          <ul className="space-y-3">
            {features.map(({ icon: Icon, label, color }) => (
              <motion.li
                key={label}
                variants={itemVariants}
                className="flex items-center gap-3"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}28` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-sm text-[#a3aed0]">{label}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* ── Floating preview cards ── */}
        <div className="relative h-48 w-full">
          {/* BTC card */}
          <FloatCard delay={0} amplitude={7} className="absolute left-0 top-2">
            <div
              className="rounded-xl p-3 border border-white/8 w-48"
              style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(14px)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src="https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
                  alt="BTC"
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className="text-white text-xs font-semibold">Bitcoin</span>
                <span className="ml-auto text-[10px] text-[#76da44] flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" />2.4%
                </span>
              </div>
              <MiniSparkline data={BTC_LINE} color="#adef37" />
            </div>
          </FloatCard>

          {/* Practice mode card */}
          <FloatCard delay={0.8} amplitude={6} className="absolute right-0 top-0">
            <div
              className="rounded-xl p-3 border border-white/8 w-44"
              style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(14px)' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className="text-[10px] text-[#a3aed0] font-medium">Practice Mode</span>
              </div>
              <p className="text-white text-sm font-bold">$100,000</p>
              <p className="text-[10px] text-[#a3aed0] mt-0.5">Virtual USDT to start</p>
            </div>
          </FloatCard>

          {/* ETH card */}
          <FloatCard delay={1.4} amplitude={9} className="absolute left-10 bottom-0">
            <div
              className="rounded-xl p-3 border border-white/8 w-44"
              style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(14px)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src="https://assets.coingecko.com/coins/images/279/large/ethereum.png"
                  alt="ETH"
                  width={18}
                  height={18}
                  className="rounded-full"
                />
                <span className="text-white text-xs font-semibold">Ethereum</span>
                <span className="ml-auto text-[10px] text-red-400 flex items-center gap-0.5">
                  <ArrowDownRight className="w-2.5 h-2.5" />1.1%
                </span>
              </div>
              <MiniSparkline data={ETH_LINE} color="#a78bfa" />
            </div>
          </FloatCard>

          {/* AI insight badge */}
          <FloatCard delay={2} amplitude={5} className="absolute right-4 bottom-6">
            <div
              className="rounded-xl px-3 py-2 border border-purple-500/25 flex items-center gap-2"
              style={{ background: 'rgba(167,139,250,0.08)', backdropFilter: 'blur(12px)' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] text-purple-300 font-medium">AI Insights ready</span>
            </div>
          </FloatCard>
        </div>
      </div>

      {/* ══════ RIGHT: Clerk form ══════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative">
        {/* Mobile-only ambient blob */}
        <div className="pointer-events-none absolute inset-0 lg:hidden overflow-hidden">
          <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-[#adef37]/5 blur-[80px]" />
          <div className="absolute bottom-0 -left-20 w-[250px] h-[250px] rounded-full bg-purple-700/8 blur-[70px]" />
        </div>

        {/* Mobile logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 lg:hidden"
        >
          <Link href="/">
            <Image src="/logo.svg" alt="CoinPulse" width={110} height={34} />
          </Link>
        </motion.div>

        {/* Clerk card entrance */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          {children}
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <Link
            href="/"
            className="text-xs text-[#a3aed0] hover:text-white transition-colors flex items-center gap-1"
          >
            ← Back to CoinPulse
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

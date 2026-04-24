import { SignUp } from '@clerk/nextjs';
import AuthPageLayout from '@/app/components/AuthPageLayout';
import { BarChart2, Wallet, Bell, Sparkles, TrendingUp, Star } from 'lucide-react';

const FEATURES = [
  { icon: TrendingUp, label: 'Start with $100,000 virtual USDT — trade risk-free', color: '#38bdf8' },
  { icon: BarChart2,  label: 'Live Binance charts across 1m, 5m, 15m, 1h, 1d',   color: '#adef37' },
  { icon: Sparkles,   label: 'Claude AI reviews your portfolio and trade history', color: '#a78bfa' },
  { icon: Wallet,     label: 'Log holdings and track real-time P&L & allocation',  color: '#2ebe7b' },
  { icon: Bell,       label: 'Set target prices — alerts checked on page open',    color: '#facc15' },
  { icon: Star,       label: 'Watchlist: star any coin and monitor in one feed',   color: '#fb923c' },
];

export default function SignUpPage() {
  return (
    <AuthPageLayout
      heading={`Start your crypto journey`}
      subtext={
        <>
          Create a free account and get{' '}
          <span className="text-[#adef37] font-semibold">$100,000</span> in virtual trading
          funds — no credit card, no catch.
        </>
      }
      features={FEATURES}
    >
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md mx-auto',
            card: 'bg-[#0f1316] border border-white/10 shadow-2xl rounded-2xl',
            headerTitle: 'text-white',
            headerSubtitle: 'text-gray-400',
            socialButtonsBlockButton:
              'bg-[#1a2027] border border-white/10 text-white hover:bg-[#1e2833] transition-colors',
            socialButtonsBlockButtonText: 'text-white font-medium',
            dividerLine: 'bg-white/10',
            dividerText: 'text-gray-500',
            formFieldLabel: 'text-gray-300',
            formFieldInput:
              'bg-[#1a2027] border-white/10 text-white placeholder:text-gray-500 focus:border-[#adef37]/50 focus:ring-0 rounded-xl',
            formButtonPrimary:
              'bg-[#adef37] text-black font-semibold hover:bg-[#adef37]/90 transition-colors rounded-xl',
            footerActionLink: 'text-[#adef37] hover:text-[#adef37]/80',
            identityPreviewText: 'text-white',
            identityPreviewEditButton: 'text-[#adef37]',
            formFieldInputShowPasswordButton: 'text-gray-400',
            alertText: 'text-red-400',
          },
        }}
      />
    </AuthPageLayout>
  );
}

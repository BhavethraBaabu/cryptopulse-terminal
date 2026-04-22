import { SignIn } from '@clerk/nextjs';
import AuthPageLayout from '@/app/components/AuthPageLayout';
import { BarChart2, Wallet, Bell, Sparkles, TrendingUp, Star } from 'lucide-react';

const FEATURES = [
  { icon: BarChart2,  label: 'Live candlestick charts powered by Binance',      color: '#adef37' },
  { icon: Wallet,     label: 'Portfolio tracker with live P&L',                  color: '#2ebe7b' },
  { icon: TrendingUp, label: '$100,000 virtual USDT for practice trading',       color: '#38bdf8' },
  { icon: Bell,       label: 'Price alerts checked against live market data',    color: '#facc15' },
  { icon: Sparkles,   label: 'Claude AI analyses your portfolio & trade history',color: '#a78bfa' },
  { icon: Star,       label: 'Watchlist with real-time price updates',           color: '#fb923c' },
];

export default function SignInPage() {
  return (
    <AuthPageLayout
      heading="Welcome back to CoinPulse"
      subtext="Sign in to access your portfolio, watchlist, price alerts and practice trading account."
      features={FEATURES}
    >
      <SignIn
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
            formResendCodeLink: 'text-[#adef37]',
          },
        }}
      />
    </AuthPageLayout>
  );
}

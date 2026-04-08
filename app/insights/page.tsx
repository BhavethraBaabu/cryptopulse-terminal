import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { db } from '@/lib/db';
import InsightsClient from './InsightsClient';

export default async function InsightsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Check if user has any data to analyse
  const [portfolio, wallet] = await Promise.all([
    db.portfolio.findUnique({
      where: { clerkUserId: userId },
      select: { positions: { select: { id: true }, take: 1 } },
    }),
    db.virtualWallet.findUnique({
      where: { clerkUserId: userId },
      select: { trades: { select: { id: true }, take: 1 } },
    }),
  ]);

  const hasData =
    (portfolio?.positions.length ?? 0) > 0 ||
    (wallet?.trades.length ?? 0) > 0;

  return (
    <main className="main-container" aria-label="AI portfolio insights">
      <div className="flex items-center gap-3">
        <Sparkles className="text-[#adef37]" size={26} aria-hidden="true" />
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">AI Insights</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Claude analyses your portfolio and practice trades in real time
          </p>
        </div>
      </div>

      <InsightsClient hasData={hasData} />
    </main>
  );
}

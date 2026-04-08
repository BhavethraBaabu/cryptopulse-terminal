'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

/** Add or remove a coin from the user's watchlist. Returns the action taken. */
export async function toggleWatchlist(coinSymbol: string, coinName: string) {
  const { userId } = await auth();
  if (!userId) return { error: 'UNAUTHORIZED' as const };

  const existing = await db.watchlist.findUnique({
    where: { clerkUserId_coinSymbol: { clerkUserId: userId, coinSymbol } },
  });

  if (existing) {
    await db.watchlist.delete({ where: { id: existing.id } });
    revalidatePath('/watchlist');
    return { success: true, action: 'removed' as const };
  }

  await db.watchlist.create({
    data: { clerkUserId: userId, coinSymbol, coinName },
  });
  revalidatePath('/watchlist');
  return { success: true, action: 'added' as const };
}

/** Get all watchlist entries for the current user, newest first. */
export async function getWatchlist() {
  const { userId } = await auth();
  if (!userId) return [];

  return db.watchlist.findMany({
    where: { clerkUserId: userId },
    orderBy: { addedAt: 'desc' },
  });
}

/** Get just the coin symbols as a Set – cheap to call in list pages. */
export async function getWatchlistSymbols(): Promise<Set<string>> {
  const { userId } = await auth();
  if (!userId) return new Set();

  const items = await db.watchlist.findMany({
    where: { clerkUserId: userId },
    select: { coinSymbol: true },
  });

  return new Set(items.map((i) => i.coinSymbol));
}

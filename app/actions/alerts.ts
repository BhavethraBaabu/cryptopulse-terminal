'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error('UNAUTHORIZED');
  return userId;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createAlert(
  coinSymbol: string,
  coinName: string,
  condition: 'above' | 'below',
  targetPrice: number,
) {
  const userId = await requireUser();

  await db.priceAlert.create({
    data: { clerkUserId: userId, coinSymbol, coinName, condition, targetPrice },
  });

  revalidatePath('/alerts');
  return { success: true };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getAlerts() {
  const userId = await requireUser();
  return db.priceAlert.findMany({
    where: { clerkUserId: userId },
    orderBy: { createdAt: 'desc' },
  });
}

/** Count of triggered (unread) alerts – used by the notification bell. */
export async function getTriggeredCount(): Promise<number> {
  try {
    const { userId } = await auth();
    if (!userId) return 0;
    return db.priceAlert.count({ where: { clerkUserId: userId, triggered: true } });
  } catch {
    return 0;
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteAlert(id: string) {
  const userId = await requireUser();

  const alert = await db.priceAlert.findFirst({ where: { id } });
  if (!alert || alert.clerkUserId !== userId) throw new Error('NOT_FOUND');

  await db.priceAlert.delete({ where: { id } });
  revalidatePath('/alerts');
  return { success: true };
}

/** Dismiss (delete) all triggered alerts at once. */
export async function dismissTriggeredAlerts() {
  const userId = await requireUser();
  await db.priceAlert.deleteMany({ where: { clerkUserId: userId, triggered: true } });
  revalidatePath('/alerts');
  return { success: true };
}

// ─── Check & Trigger ──────────────────────────────────────────────────────────

/**
 * Fetch live prices for all pending alerts, mark any that have crossed
 * their target as triggered. Called server-side when loading /alerts.
 */
export async function checkAndTriggerAlerts() {
  const userId = await requireUser();

  const pending = await db.priceAlert.findMany({
    where: { clerkUserId: userId, triggered: false },
  });

  if (pending.length === 0) return;

  // Batch-fetch current prices from Binance
  const symbols = [...new Set(pending.map((a) => a.coinSymbol))];
  let priceMap: Record<string, number> = {};

  try {
    const res = await fetch(
      `https://api.binance.us/api/v3/ticker/price?symbols=${JSON.stringify(symbols)}`,
      { cache: 'no-store' },
    );
    if (res.ok) {
      const data: { symbol: string; price: string }[] = await res.json();
      priceMap = Object.fromEntries(data.map((d) => [d.symbol, parseFloat(d.price)]));
    }
  } catch {}

  // Determine which alerts have been triggered
  const now = new Date();
  const toTrigger = pending.filter((a) => {
    const current = priceMap[a.coinSymbol];
    if (current === undefined) return false;
    return a.condition === 'above' ? current >= a.targetPrice : current <= a.targetPrice;
  });

  if (toTrigger.length > 0) {
    await db.priceAlert.updateMany({
      where: { id: { in: toTrigger.map((a) => a.id) } },
      data: { triggered: true, triggeredAt: now },
    });
  }
}

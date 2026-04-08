'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

const FEE_RATE = 0.001; // 0.1%

// ── Get or create wallet ──────────────────────────────────────────────────────

async function getOrCreateWallet(userId: string) {
  return db.virtualWallet.upsert({
    where: { clerkUserId: userId },
    create: { clerkUserId: userId },
    update: {},
    include: { positions: true, trades: { orderBy: { timestamp: 'desc' }, take: 50 } },
  });
}

// ── Public actions ────────────────────────────────────────────────────────────

export async function getWallet() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');
  return getOrCreateWallet(userId);
}

export async function executeTrade(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const coinSymbol = formData.get('coinSymbol') as string;
  const coinName = formData.get('coinName') as string;
  const side = formData.get('side') as 'buy' | 'sell';
  const quantity = parseFloat(formData.get('quantity') as string);
  const executedPrice = parseFloat(formData.get('executedPrice') as string);

  if (!coinSymbol || !side || isNaN(quantity) || quantity <= 0 || isNaN(executedPrice) || executedPrice <= 0) {
    throw new Error('Invalid trade parameters');
  }

  const wallet = await db.virtualWallet.upsert({
    where: { clerkUserId: userId },
    create: { clerkUserId: userId },
    update: {},
    include: { positions: true },
  });

  const gross = quantity * executedPrice;
  const fee = gross * FEE_RATE;

  if (side === 'buy') {
    const cost = gross + fee;
    if (wallet.balance < cost) throw new Error('Insufficient balance');

    // Update or create position
    const existing = wallet.positions.find((p) => p.coinSymbol === coinSymbol);
    if (existing) {
      const newQty = existing.quantity + quantity;
      const newAvg = (existing.quantity * existing.avgEntryPrice + gross) / newQty;
      await db.virtualPosition.update({
        where: { id: existing.id },
        data: { quantity: newQty, avgEntryPrice: newAvg, coinName },
      });
    } else {
      await db.virtualPosition.create({
        data: { walletId: wallet.id, coinSymbol, coinName, quantity, avgEntryPrice: executedPrice },
      });
    }

    await db.virtualWallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: cost } },
    });
  } else {
    // sell
    const existing = wallet.positions.find((p) => p.coinSymbol === coinSymbol);
    if (!existing || existing.quantity < quantity) throw new Error('Insufficient position');

    const proceeds = gross - fee;

    if (existing.quantity - quantity < 0.000001) {
      await db.virtualPosition.delete({ where: { id: existing.id } });
    } else {
      await db.virtualPosition.update({
        where: { id: existing.id },
        data: { quantity: { decrement: quantity } },
      });
    }

    await db.virtualWallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: proceeds } },
    });
  }

  // Record trade
  await db.virtualTrade.create({
    data: {
      walletId: wallet.id,
      coinSymbol,
      coinName,
      side,
      quantity,
      executedPrice,
      fee,
      total: side === 'buy' ? gross + fee : gross - fee,
    },
  });

  revalidatePath('/practice');
}

export async function resetWallet() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const wallet = await db.virtualWallet.findUnique({ where: { clerkUserId: userId } });
  if (!wallet) return;

  await db.$transaction([
    db.virtualPosition.deleteMany({ where: { walletId: wallet.id } }),
    db.virtualTrade.deleteMany({ where: { walletId: wallet.id } }),
    db.virtualWallet.update({
      where: { id: wallet.id },
      data: { balance: 100000, startingBalance: 100000, resetCount: { increment: 1 } },
    }),
  ]);

  revalidatePath('/practice');
}

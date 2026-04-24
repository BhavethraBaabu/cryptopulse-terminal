'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error('UNAUTHORIZED');
  return userId;
}

/** Gets the portfolio for the current user, creating one if it doesn't exist. */
async function getOrCreatePortfolio(userId: string) {
  return db.portfolio.upsert({
    where: { clerkUserId: userId },
    create: { clerkUserId: userId },
    update: {},
  });
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/** Fetch all positions for the current user. */
export async function getPositions() {
  const userId = await requireUser();
  const portfolio = await getOrCreatePortfolio(userId);

  return db.position.findMany({
    where: { portfolioId: portfolio.id },
    orderBy: { buyDate: 'desc' },
  });
}

export interface AddPositionInput {
  coinSymbol: string;  // e.g. "BTCUSDT"
  coinName: string;    // e.g. "Bitcoin"
  quantity: number;
  avgBuyPrice: number;
  buyDate: string;     // ISO date string
  notes?: string;
}

/** Add a new position to the portfolio. */
export async function addPosition(input: AddPositionInput) {
  const userId = await requireUser();
  const portfolio = await getOrCreatePortfolio(userId);

  await db.position.create({
    data: {
      portfolioId: portfolio.id,
      coinSymbol: input.coinSymbol,
      coinName: input.coinName,
      quantity: input.quantity,
      avgBuyPrice: input.avgBuyPrice,
      buyDate: new Date(input.buyDate),
      notes: input.notes ?? '',
    },
  });

  revalidatePath('/portfolio');
  return { success: true };
}

/** Update quantity, price, or notes on an existing position. */
export async function updatePosition(
  id: string,
  input: Partial<Omit<AddPositionInput, 'coinSymbol' | 'coinName'>>,
) {
  const userId = await requireUser();

  // Verify ownership
  const position = await db.position.findFirst({
    where: { id },
    include: { portfolio: true },
  });
  if (!position || position.portfolio.clerkUserId !== userId) {
    throw new Error('NOT_FOUND');
  }

  await db.position.update({
    where: { id },
    data: {
      ...(input.quantity !== undefined && { quantity: input.quantity }),
      ...(input.avgBuyPrice !== undefined && { avgBuyPrice: input.avgBuyPrice }),
      ...(input.buyDate !== undefined && { buyDate: new Date(input.buyDate) }),
      ...(input.notes !== undefined && { notes: input.notes }),
    },
  });

  revalidatePath('/portfolio');
  return { success: true };
}

/** Delete a position from the portfolio. */
export async function deletePosition(id: string) {
  const userId = await requireUser();

  const position = await db.position.findFirst({
    where: { id },
    include: { portfolio: true },
  });
  if (!position || position.portfolio.clerkUserId !== userId) {
    throw new Error('NOT_FOUND');
  }

  await db.position.delete({ where: { id } });
  revalidatePath('/portfolio');
  return { success: true };
}

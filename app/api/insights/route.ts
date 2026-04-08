import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/lib/db';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response('Unauthorized', { status: 401 });

  // Gather portfolio data
  const [portfolioData, walletData] = await Promise.all([
    db.portfolio.findUnique({
      where: { clerkUserId: userId },
      include: { positions: true },
    }),
    db.virtualWallet.findUnique({
      where: { clerkUserId: userId },
      include: {
        positions: true,
        trades: { orderBy: { timestamp: 'desc' }, take: 20 },
      },
    }),
  ]);

  // Fetch live prices for all unique coin symbols
  const allSymbols = [
    ...(portfolioData?.positions.map((p) => p.coinSymbol) ?? []),
    ...(walletData?.positions.map((p) => p.coinSymbol) ?? []),
  ];
  const uniqueSymbols = [...new Set(allSymbols)];

  let priceMap: Record<string, number> = {};
  if (uniqueSymbols.length > 0) {
    try {
      const res = await fetch(
        `https://api.binance.us/api/v3/ticker/price?symbols=${JSON.stringify(uniqueSymbols)}`,
        { cache: 'no-store' },
      );
      if (res.ok) {
        const data: { symbol: string; price: string }[] = await res.json();
        priceMap = Object.fromEntries(data.map((d) => [d.symbol, parseFloat(d.price)]));
      }
    } catch {}
  }

  // Build context for Claude
  const portfolioSummary = portfolioData?.positions.length
    ? portfolioData.positions.map((p) => {
        const current = priceMap[p.coinSymbol] ?? p.avgBuyPrice;
        const pnl = (current - p.avgBuyPrice) * p.quantity;
        const pnlPct = ((current - p.avgBuyPrice) / p.avgBuyPrice) * 100;
        return `- ${p.coinName} (${p.coinSymbol}): ${p.quantity} units @ avg $${p.avgBuyPrice.toFixed(4)}, current $${current.toFixed(4)}, P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%)`;
      }).join('\n')
    : 'No real portfolio positions.';

  const practiceSummary = walletData
    ? [
        `Cash balance: $${walletData.balance.toFixed(2)} of $${walletData.startingBalance.toFixed(2)} starting`,
        walletData.positions.length > 0
          ? 'Practice positions:\n' + walletData.positions.map((p) => {
              const current = priceMap[p.coinSymbol] ?? p.avgEntryPrice;
              const pnl = (current - p.avgEntryPrice) * p.quantity;
              return `  - ${p.coinName} (${p.coinSymbol}): ${p.quantity.toFixed(4)} units @ $${p.avgEntryPrice.toFixed(4)}, current $${current.toFixed(4)}, P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`;
            }).join('\n')
          : 'No practice positions.',
        walletData.trades.length > 0
          ? `Last ${walletData.trades.length} practice trades:\n` + walletData.trades.slice(0, 10).map((t) =>
              `  - ${t.side.toUpperCase()} ${t.quantity.toFixed(4)} ${t.coinSymbol} @ $${t.executedPrice.toFixed(4)} (total: $${t.total.toFixed(2)})`
            ).join('\n')
          : 'No practice trades yet.',
      ].join('\n')
    : 'No practice wallet data.';

  const systemPrompt = `You are CoinPulse AI, a friendly and knowledgeable crypto portfolio analyst.
You help users understand their holdings, identify risks, and learn about trading strategies.
Be concise but insightful. Use markdown formatting with headers and bullet points.
Do NOT give specific financial advice or tell users to buy/sell specific assets.
Focus on education, pattern recognition, and helping users understand their own data.
Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;

  const userMessage = `Here is my current crypto data. Please analyze it and give me insights:

**Real Portfolio:**
${portfolioSummary}

**Practice Trading (Paper Money):**
${practiceSummary}

Please provide:
1. A brief overview of my overall position
2. Key observations about my holdings and performance
3. Any risk patterns you notice (concentration, volatility exposure, etc.)
4. 2-3 educational insights or things to watch
5. A short encouragement or tip to improve my trading knowledge`;

  // Stream the response
  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

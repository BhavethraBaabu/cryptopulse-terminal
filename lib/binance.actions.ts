'use server';

export async function fetchBinanceKlines(symbol: string, interval: string, limit: number) {
  try {
    const res = await fetch(`https://api.binance.us/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`, {
        next: { revalidate: 60 }
    });
    if (!res.ok) {
        throw new Error(`Failed to fetch klines from Binance: ${res.statusText}`);
    }
    return res.json();
  } catch(e) {
      console.error(e);
      return [];
  }
}

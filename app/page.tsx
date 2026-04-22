import React from 'react';
import LandingPage from './components/LandingPage';

const COIN_METADATA: Record<string, { id: string; name: string; image: string }> = {
  BTCUSDT: { id: 'bitcoin', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  ETHUSDT: { id: 'ethereum', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  BNBUSDT: { id: 'binancecoin', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
  SOLUSDT: { id: 'solana', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
  XRPUSDT: { id: 'ripple', name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
};

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];

const FALLBACK_TICKERS = [
  { symbol: 'BTCUSDT', id: 'bitcoin', name: 'Bitcoin', price: 83500, change: 1.24, image: COIN_METADATA['BTCUSDT'].image },
  { symbol: 'ETHUSDT', id: 'ethereum', name: 'Ethereum', price: 1580, change: -0.87, image: COIN_METADATA['ETHUSDT'].image },
  { symbol: 'BNBUSDT', id: 'binancecoin', name: 'BNB', price: 580, change: 0.55, image: COIN_METADATA['BNBUSDT'].image },
  { symbol: 'SOLUSDT', id: 'solana', name: 'Solana', price: 120, change: 2.1, image: COIN_METADATA['SOLUSDT'].image },
  { symbol: 'XRPUSDT', id: 'ripple', name: 'XRP', price: 0.52, change: -1.3, image: COIN_METADATA['XRPUSDT'].image },
];

export default async function Page() {
  let tickers = FALLBACK_TICKERS;

  try {
    const res = await fetch(
      `https://api.binance.us/api/v3/ticker/24hr?symbols=${JSON.stringify(SYMBOLS)}`,
      { next: { revalidate: 60 } },
    );
    if (res.ok) {
      const data: any[] = await res.json();
      if (Array.isArray(data) && data.length) {
        tickers = data.map((d) => {
          const meta = COIN_METADATA[d.symbol];
          return {
            symbol: d.symbol,
            id: meta.id,
            name: meta.name,
            price: parseFloat(d.lastPrice),
            change: parseFloat(d.priceChangePercent),
            image: meta.image,
          };
        });
      }
    }
  } catch {
    // use fallback silently
  }

  return <LandingPage tickers={tickers} />;
}

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@clerk/nextjs/server';
import GlassCoinChart from '@/app/components/GlassCoinChart';
import LiveTradeFeedWrapper from '@/app/components/LiveTradeFeedWrapper';
import CoinIcon from '@/app/components/CoinIcon';
import WatchlistButton from '@/app/components/WatchlistButton';
import CoinDescription from './CoinDescription';
import AddAlertForm from './AddAlertForm';
import { searchCoin, getCoinDetails } from '@/lib/coingecko.actions';
import { getWatchlistSymbols } from '@/app/actions/watchlist';
import { TrendingUp, TrendingDown, ArrowUpRight, Globe, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import FadeUp from '@/app/components/FadeUp';

// ─── Formatting helpers ────────────────────────────────────────────────────────

function fmt(n: number, opts?: Intl.NumberFormatOptions) {
  return n.toLocaleString('en-US', opts);
}

function fmtPrice(n: number) {
  return `$${fmt(n, { minimumFractionDigits: n >= 1 ? 2 : 6, maximumFractionDigits: n >= 1 ? 6 : 10 })}`;
}

function fmtLarge(n: number): string {
  if (!n || isNaN(n)) return '-';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${fmt(n, { maximumFractionDigits: 0 })}`;
}

function fmtSupply(n: number, symbol: string): string {
  if (!n || isNaN(n)) return '-';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B ${symbol}`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M ${symbol}`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K ${symbol}`;
  return `${fmt(n, { maximumFractionDigits: 2 })} ${symbol}`;
}

function fmtPct(n: number): string {
  if (n === null || n === undefined || isNaN(n)) return '-';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

function fmtDate(iso: string): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function PctBadge({ value, className }: { value: number | null | undefined; className?: string }) {
  if (value === null || value === undefined || isNaN(value)) return <span className="text-gray-500">-</span>;
  const up = value >= 0;
  return (
    <span className={cn('flex items-center gap-0.5 font-medium', up ? 'text-green-500' : 'text-red-500', className)}>
      {up ? <TrendingUp size={13} aria-hidden="true" /> : <TrendingDown size={13} aria-hidden="true" />}
      {fmtPct(value)}
    </span>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function CoinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // e.g. 'BTCUSDT'
  const baseSymbol = id.replace('USDT', '').toLowerCase(); // 'btc'

 
  const [tickerResult, searchResult, authResult, watchedResult] = await Promise.allSettled([
    fetch(`https://api.binance.us/api/v3/ticker/24hr?symbol=${id}`, { next: { revalidate: 60 } }).then((r) => {
      if (r.status === 400 || r.status === 404) return null;
      if (!r.ok) throw new Error(`Binance ticker ${r.status}`);
      return r.json();
    }),
    searchCoin(baseSymbol),
    auth(),
    getWatchlistSymbols(),
  ]);

  const userId = authResult.status === 'fulfilled' ? authResult.value.userId : null;
  const watchedSymbols: Set<string> = watchedResult.status === 'fulfilled' ? watchedResult.value : new Set();

  const tickerData = tickerResult.status === 'fulfilled' ? tickerResult.value : null;
  if (!tickerData) return notFound();

  // ── Step 2: Resolve CoinGecko ID and fetch details ──
  let coinDetails: any = null;
  if (searchResult.status === 'fulfilled' && searchResult.value?.coins?.length) {
    const coins = searchResult.value.coins;
    // Prefer exact symbol match, fall back to first result
    const match = coins.find((c) => c.symbol.toLowerCase() === baseSymbol) ?? coins[0];
    try {
      coinDetails = await getCoinDetails(match.id);
    } catch {
      // CoinGecko may rate-limit; page still works with Binance-only data
    }
  }

  // ── Derived values ──
  const currentPrice = parseFloat(tickerData.lastPrice) || 0;
  const change24h = parseFloat(tickerData.priceChangePercent) || 0;
  const isUp = change24h >= 0;
  const symbolTrimmed = tickerData.symbol.replace('USDT', '');

  // Prefer CoinGecko image; fall back to CoinCap CDN
  const coinImage =
    coinDetails?.image?.large ??
    `https://assets.coincap.io/assets/icons/${baseSymbol}@2x.png`;

  const coinName = coinDetails?.name ?? symbolTrimmed;

  const md = coinDetails?.market_data ?? null; // shorthand

  // Supply progress (circulating / max)
  const circulatingSupply = md?.circulating_supply ?? null;
  const maxSupply = md?.max_supply ?? null;
  const supplyPct =
    circulatingSupply && maxSupply ? Math.min((circulatingSupply / maxSupply) * 100, 100) : null;

  // External links
  const homepage = coinDetails?.links?.homepage?.[0] ?? null;
  const explorers: string[] = (coinDetails?.links?.blockchain_site ?? []).filter(Boolean).slice(0, 2);
  const twitterHandle = coinDetails?.links?.twitter_screen_name ?? null;
  const subreddit = coinDetails?.links?.subreddit_url ?? null;

  return (
    <main id="coin-details-page" aria-label={`${coinName} market details`}>
      {/* ── Primary: chart + live trades ── */}
      <section className="primary space-y-6" aria-label="Price chart and live trades">
        <FadeUp delay={0}>
        <GlassCoinChart
          coinSymbol={symbolTrimmed}
          coinName={coinName}
          coinImage={coinImage}
          currentPrice={currentPrice}
          className="min-h-[520px]"
        />

        </FadeUp>

        <FadeUp delay={0.1}>
          <div id="coin-header" className="mt-8 mb-6">
            <h3 className="text-3xl font-medium tracking-tight">On-Chain Trade Feed</h3>
          </div>
          <LiveTradeFeedWrapper coinId={baseSymbol} />
        </FadeUp>
      </section>

      {/* ── Secondary: all coin info ── */}
      <section className="secondary space-y-6" aria-label="Coin information">

        {/* ── Price card ── */}
        <FadeUp delay={0}>
        <div id="coin-card" role="region" aria-label={`${coinName} price card`}>
          <div className="header">
            <div className="flex items-center gap-4 w-full">
              <div className="bg-dark-400 p-2 rounded-2xl shadow-lg border-2 border-white/5 shrink-0 flex items-center justify-center w-14 h-14 relative overflow-hidden">
                {coinDetails?.image?.large ? (
                  <Image
                    src={coinDetails.image.large}
                    alt={coinName}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain p-0.5"
                  />
                ) : (
                  <CoinIcon symbol={symbolTrimmed} className="w-full h-full object-contain p-1 z-10" />
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="truncate">{coinName}</h3>
                  {coinDetails?.market_cap_rank && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-600/40 text-purple-100 shrink-0">
                      #{coinDetails.market_cap_rank}
                    </span>
                  )}
                </div>
                <p className="uppercase">{tickerData.symbol}</p>
              </div>
              {/* Watchlist star */}
              <WatchlistButton
                coinSymbol={id}
                coinName={coinName}
                initialIsWatched={watchedSymbols.has(id)}
                isSignedIn={!!userId}
                size="lg"
              />
            </div>
          </div>

          <div className="price-row">
            <div className="price">{fmtPrice(currentPrice)}</div>
            <div className={cn('change', isUp ? 'badge badge-up' : 'badge badge-down')}>
              {isUp ? <TrendingUp size={16} aria-hidden="true" /> : <TrendingDown size={16} aria-hidden="true" />}
              <span>{fmtPct(change24h)}</span>
            </div>
          </div>

          <div className="stats border-t border-dark-400 pt-4 pb-2">
            <div className="stat-row">
              <span className="label">24h High</span>
              <span className="value text-green-500">{fmtPrice(parseFloat(tickerData.highPrice))}</span>
            </div>
            <div className="stat-row">
              <span className="label">24h Low</span>
              <span className="value text-red-400">{fmtPrice(parseFloat(tickerData.lowPrice))}</span>
            </div>
            <div className="stat-row">
              <span className="label">Wtd Avg Price</span>
              <span className="value">{fmtPrice(parseFloat(tickerData.weightedAvgPrice))}</span>
            </div>
            {md?.price_change_percentage_7d !== undefined && (
              <div className="stat-row">
                <span className="label">7d Change</span>
                <PctBadge value={md.price_change_percentage_7d} className="value" />
              </div>
            )}
            {md?.price_change_percentage_30d !== undefined && (
              <div className="stat-row">
                <span className="label">30d Change</span>
                <PctBadge value={md.price_change_percentage_30d} className="value" />
              </div>
            )}
          </div>
        </div>
        </FadeUp>

        {/* ── Market Overview ── */}
        {md && (
          <FadeUp delay={0.08}>
          <div className="details">
            <h4>Market Overview</h4>
            <ul className="details-grid">
              <li>
                <p className="label">Market Cap</p>
                <p className="text-base font-semibold">{fmtLarge(md.market_cap?.usd)}</p>
              </li>
              <li>
                <p className="label">Fully Diluted Val.</p>
                <p className="text-base font-semibold">{fmtLarge(md.fully_diluted_valuation?.usd)}</p>
              </li>
              <li>
                <p className="label">24h Volume</p>
                <p className="text-base font-semibold">{fmtLarge(md.total_volume?.usd)}</p>
              </li>
              <li>
                <p className="label">24h Trades</p>
                <p className="text-base font-semibold">{tickerData.count?.toLocaleString() ?? '-'}</p>
              </li>
              {md.market_cap?.usd > 0 && md.total_volume?.usd > 0 && (
                <li>
                  <p className="label">Vol / Mkt Cap</p>
                  <p className="text-base font-semibold">
                    {(md.total_volume.usd / md.market_cap.usd).toFixed(4)}
                  </p>
                </li>
              )}
              <li>
                <p className="label">Trade on Binance</p>
                <div className="link">
                  <Link
                    href={`https://www.binance.com/en/trade/${tickerData.symbol}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Trade ${symbolTrimmed} on Binance`}
                  >
                    Binance
                  </Link>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </div>
              </li>
            </ul>
          </div>
          </FadeUp>
        )}

        {/* ── Supply Info ── */}
        {md && (circulatingSupply || md.total_supply || maxSupply) && (
          <FadeUp delay={0.13}>
          <div className="details">
            <h4>Supply</h4>
            <ul className="details-grid">
              {circulatingSupply && (
                <li>
                  <p className="label">Circulating</p>
                  <p className="text-base font-semibold">{fmtSupply(circulatingSupply, symbolTrimmed)}</p>
                </li>
              )}
              {md.total_supply && (
                <li>
                  <p className="label">Total Supply</p>
                  <p className="text-base font-semibold">{fmtSupply(md.total_supply, symbolTrimmed)}</p>
                </li>
              )}
              {maxSupply && (
                <li>
                  <p className="label">Max Supply</p>
                  <p className="text-base font-semibold">{fmtSupply(maxSupply, symbolTrimmed)}</p>
                </li>
              )}
            </ul>
            {supplyPct !== null && (
              <div className="mt-4 px-0.5">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Circulating supply</span>
                  <span>{supplyPct.toFixed(1)}% of max</span>
                </div>
                <div className="h-2 w-full bg-dark-400 rounded-full overflow-hidden" role="progressbar" aria-valuenow={supplyPct} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className="h-full rounded-full bg-[#adef37]"
                    style={{ width: `${supplyPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          </FadeUp>
        )}

        {/* ── ATH / ATL ── */}
        {md?.ath?.usd && (
          <FadeUp delay={0.18}>
            <div className="details">
              <h4>Price History</h4>
              <ul className="details-grid">
                <li>
                  <p className="label">All-Time High</p>
                  <p className="text-base font-semibold text-green-400">{fmtPrice(md.ath.usd)}</p>
                  <PctBadge value={md.ath_change_percentage?.usd} />
                  <p className="text-xs text-gray-500 mt-1">{fmtDate(md.ath_date?.usd)}</p>
                </li>
                <li>
                  <p className="label">All-Time Low</p>
                  <p className="text-base font-semibold text-red-400">{fmtPrice(md.atl?.usd)}</p>
                  <PctBadge value={md.atl_change_percentage?.usd} />
                  <p className="text-xs text-gray-500 mt-1">{fmtDate(md.atl_date?.usd)}</p>
                </li>
              </ul>
            </div>
          </FadeUp>
        )}

        {/* ── Links ── */}
        {(homepage || explorers.length > 0 || twitterHandle || subreddit) && (
          <FadeUp delay={0.22}>
            <div className="details">
              <h4>Links</h4>
              <ul className="details-grid">
                {homepage && (
                  <li>
                    <p className="label">Website</p>
                    <div className="link">
                      <Link href={homepage} target="_blank" rel="noopener noreferrer"
                        className="truncate max-w-40" aria-label={`${coinName} website`}>
                        <Globe size={14} className="inline mr-1" aria-hidden="true" />
                        {new URL(homepage).hostname}
                      </Link>
                      <ExternalLink size={14} aria-hidden="true" />
                    </div>
                  </li>
                )}
                {explorers.map((url) => (
                  <li key={url}>
                    <p className="label">Explorer</p>
                    <div className="link">
                      <Link href={url} target="_blank" rel="noopener noreferrer"
                        className="truncate max-w-40" aria-label="Blockchain explorer">
                        {new URL(url).hostname}
                      </Link>
                      <ExternalLink size={14} aria-hidden="true" />
                    </div>
                  </li>
                ))}
                {twitterHandle && (
                  <li>
                    <p className="label">Twitter / X</p>
                    <div className="link">
                      <Link href={`https://twitter.com/${twitterHandle}`} target="_blank" rel="noopener noreferrer"
                        aria-label={`${coinName} Twitter`}>
                        @{twitterHandle}
                      </Link>
                      <ExternalLink size={14} aria-hidden="true" />
                    </div>
                  </li>
                )}
                {subreddit && (
                  <li>
                    <p className="label">Reddit</p>
                    <div className="link">
                      <Link href={subreddit} target="_blank" rel="noopener noreferrer"
                        aria-label={`${coinName} Reddit`}>
                        {subreddit.replace('https://www.reddit.com/', '').replace(/\/$/, '')}
                      </Link>
                      <ExternalLink size={14} aria-hidden="true" />
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </FadeUp>
        )}

        {/* ── Set Price Alert ── */}
        <FadeUp delay={0.26}>
          <AddAlertForm
            coinSymbol={id}
            coinName={coinName}
            currentPrice={currentPrice}
            isSignedIn={!!userId}
          />
        </FadeUp>

        {/* ── About (expandable description) ── */}
        {coinDetails?.description?.en && (
          <FadeUp delay={0.3}>
            <CoinDescription
              description={coinDetails.description.en}
              coinName={coinName}
            />
          </FadeUp>
        )}
      </section>
    </main>
  );
}

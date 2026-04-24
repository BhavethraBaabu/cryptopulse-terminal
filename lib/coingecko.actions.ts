'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL || !API_KEY) {
    throw new Error('Missing environment variables');
}

export async function fetcher<T>(
    endpoint: string,
    params?: Record<string, any>,
    revalidate = 60,
): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = qs.stringifyUrl({
        url: `${BASE_URL}/${cleanEndpoint}`,
        query: params
    }, { skipEmptyString: true, skipNull: true })

    const isPro = BASE_URL?.includes('pro-api');
    const apiKeyHeader = isPro ? 'x-cg-pro-api-key' : 'x-cg-demo-api-key';

    let response = await fetch(url, {
        headers: {
            [apiKeyHeader]: API_KEY,
            "Content-Type": "application/json",
        } as Record<string, string>,
        next: { revalidate }
    });

    // Smart Fallback: If Pro API key fails with 400, 401 or 403, and they are using pro URL, 
    // seamlessly downgrade to the public demo URL to save the application.
    if (!response.ok && (response.status === 400 || response.status === 401 || response.status === 403) && isPro) {
        console.warn(`CoinGecko Pro API failed (${response.status}). Retrying with public Demo API...`);
        const fallbackUrl = qs.stringifyUrl({
            url: `https://api.coingecko.com/api/v3/${cleanEndpoint}`,
            query: params
        }, { skipEmptyString: true, skipNull: true });

        response = await fetch(fallbackUrl, {
            headers: {
                'x-cg-demo-api-key': API_KEY,
                "Content-Type": "application/json",
            } as Record<string, string>,
            next: { revalidate }
        });
    }

    if (!response.ok) {
        let errorMsg = `API Error: ${response.status}`;
        try {
            const errorBody = await response.json();
            if (errorBody.error) errorMsg = errorBody.error;
        } catch (e) {}
        throw new Error(errorMsg);
    }
    
    return response.json()
}

/** Search CoinGecko for a coin by symbol/name. Returns null on failure. */
export async function searchCoin(query: string): Promise<{
  coins: Array<{ id: string; symbol: string; name: string; thumb: string; market_cap_rank: number | null }>;
} | null> {
  try {
    return await fetcher('/search', { query }, 3600);
  } catch {
    return null;
  }
}

/** Fetch full coin details from CoinGecko by CoinGecko coin ID (e.g. "bitcoin"). */
export async function getCoinDetails(coinId: string) {
  return fetcher<any>(`/coins/${coinId}`, {
    localization: false,
    tickers: false,
    market_data: true,
    community_data: false,
    developer_data: false,
    sparkline: false,
  }, 60);
}
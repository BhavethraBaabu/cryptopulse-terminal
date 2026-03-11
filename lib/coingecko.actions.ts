'use server';

import qs from 'query-string';

const BASE_URL = 'https://api.coingecko.com/api/v3/';
const API_KEY = "CG-a41FCVCXUpUgz2fhe7hMLBGB";

if (!BASE_URL || !API_KEY) {
    throw new Error('Missing environment variables');
}

export async function fetcher<T>(
    endpoint: string,
    params?: QueryParams,
    revalidate = 60,
): Promise<T> {
    const url = qs.stringifyUrl({
        url: `${BASE_URL}/${endpoint}`,
        query: params
    }, { skipEmptyString: true, skipNull: true })

    const response = await fetch(url, {
        headers: {
            "x-cg-demo-api-key": API_KEY,
            "Content-Type": "application/json",
        } as Record<string, string>,
        next: { revalidate }
    }
    )
    if (!response.ok) {
        const errorBody: CoinGeckoErrorBody = await response.json().catch(() => ({}))
        throw new Error(errorBody.error || `API Error: ${response.status}`)
    }
    return response.json()
}
const CACHE_DURATION = 30 * 1000; // 30 seconds
let cachedPrice: number | null = null;
let lastFetchTime = 0;

export async function getPriceCoinGecko(token: string, currency: string): Promise<number> {
    const now = Date.now();

    // Return cached value if within 30 seconds
    if (cachedPrice !== null && now - lastFetchTime < CACHE_DURATION) {
        return cachedPrice;
    }

    // Fetch new price from CoinGecko
    const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=${currency}`
    ).then((res) => res.json());

    if (!res || res === null) {
        throw new Error('Failed to fetch price from CoinGecko');
    }

    const price = res[token]?.[currency];

    if (typeof price === 'number') {
        cachedPrice = price;
        lastFetchTime = now;
    }

    return price;
}

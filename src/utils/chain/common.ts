const CACHE_DURATION = 30 * 1000; // 30 seconds

const priceCache: { [key: string]: { price: number; timestamp: number } } = {};

export async function getPriceCoinGecko(token: string, currency: string): Promise<number> {
    const cacheKey = `${token}-${currency}`;
    const now = Date.now();

    // Return cached value if within 30 seconds
    if (priceCache[cacheKey] !== null && now - priceCache[cacheKey].timestamp < CACHE_DURATION) {
        return priceCache[cacheKey].price;
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
        priceCache[cacheKey] = {
            price: price,
            timestamp: now,
        };
    }

    return price;
}

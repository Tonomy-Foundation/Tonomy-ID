export async function getPriceCoinGecko(token: string, currency: string): Promise<number> {
    const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=${currency}`
    ).then((res) => res.json());

    return res?.ethereum?.usd;
}

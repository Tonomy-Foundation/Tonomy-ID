import settings from '../settings';
import Debug from 'debug';

const debug = Debug('tonomy-id:utils:helper');

export function extractHostname(url): string {
    const urlObject = new URL(url);

    if (urlObject.protocol !== 'https:' && urlObject.protocol !== 'http:') {
        return 'Invalid URL';
    }

    if (settings.isProduction() && !urlObject) {
        return 'Invalid URL - Must use HTTPS';
    }

    return urlObject.hostname;
}

export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export async function progressiveRetryOnNetworkError(
    fn: () => Promise<void>,
    initialDelay = 10000,
    maxDelay = 3600000
) {
    let condition = true;
    let delay = initialDelay;

    while (condition) {
        try {
            await fn(); // Try the function
            condition = false;
            break; // If it succeeds, exit the loop
        } catch (error) {
            if (
                (error.message && error.message === 'Network request failed') ||
                (error.msg && error.msg.includes('No internet connection'))
            ) {
                debug(`Retrying in ${delay / 1000} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay = Math.min(delay * 2, maxDelay); // Exponential backoff
            } else {
                // Non-network error, throw it
                console.error('Non-network error occurred. Stopping retry.', error);
                throw error;
            }
        }
    }
}

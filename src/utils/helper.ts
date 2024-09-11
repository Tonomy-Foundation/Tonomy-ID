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

export async function progressiveRetryOnNetworkError(fn, initialDelay = 10000, maxDelay = 3600000, maxRetries = 5) {
    let delay = initialDelay;
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            await fn();
            break;
        } catch (error) {
            debug('Error function called:', error);

            if (error.message === 'Network request failed') {
                attempts++;

                if (attempts >= maxRetries) {
                    debug('Max retries reached. Stopping retry.');
                    throw new Error('Max retries reached. Network request failed.');
                }

                debug(`Retrying in ${delay / 1000} seconds... (Attempt ${attempts} of ${maxRetries})`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay = Math.min(delay * 2, maxDelay); // Double the interval, cap at maxDelay
            } else {
                debug('Non-network error occurred. Stopping retry.');
                throw error;
            }
        }
    }
}

import settings from '../settings';
import DebugAndLog from '../utils/debug';
import { sleep } from './sleep';
import { isNetworkError } from './errors';
import { captureError } from './sentry';

const debug = DebugAndLog('tonomy-id:utils:network');

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
            debug('progressiveRetryOnNetworkError()', fn.name + '()', error, typeof error);

            if (isNetworkError(error)) {
                debug(`Retrying ${fn.name}() in ${delay / 1000} seconds...`);
                await sleep(delay);
                delay = Math.min(delay * 2, maxDelay); // Exponential backoff
            } else {
                captureError(`progressiveRetryOnNetworkError() Non-network error occurred: ${fn.name}`, error);
                throw error;
            }
        }
    }
}

export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

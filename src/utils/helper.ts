import settings from '../settings';

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

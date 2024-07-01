import settings from '../settings';

export function extractOrigin(url): string {
    const urlObject = new URL(url);

    if (urlObject.protocol !== 'https:' && urlObject.protocol !== 'http:') {
        return 'Invalid URL';
    }

    if (settings.isProduction() && !urlObject) {
        return 'Invalid URL - Must use HTTPS';
    }

    return urlObject.origin;
}

export function formatAccountAddress(account) {
    return `${account?.substring(0, 7)}...${account?.substring(account.length - 6)}`;
}

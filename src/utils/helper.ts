import settings from '../settings';

export function extractOrigin(url): string {
    const hasHttpsProtocol = new URL(url);

    if (hasHttpsProtocol.protocol !== 'https:' && hasHttpsProtocol.protocol !== 'http:') {
        return 'Invalid URL';
    }

    const hostname = new URL(url).hostname;

    if (settings.isProduction() && !hasHttpsProtocol) {
        return 'Invalid URL - Must use HTTPS';
    }

    return hostname;
}

export function formatAccountAddress(account) {
    return `${account?.substring(0, 7)}...${account?.substring(account.length - 6)}`;
}

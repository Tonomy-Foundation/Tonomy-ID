export function extractOrigin(url) {
    const hasHttpProtocol = url.startsWith('http://');
    const hasHttpsProtocol = url.startsWith('https://');

    if (!hasHttpProtocol && !hasHttpsProtocol) {
        return 'Invalid URL';
    }

    const hostname = new URL(url).hostname;

    if (process.env.NODE_ENV === 'production' && !hasHttpsProtocol) {
        return 'Invalid URL - Must use HTTPS';
    }

    console.log('hostname', hostname);
    return hostname;
}

export function formatAccountAddress(account) {
    return `${account?.substring(0, 7)}...${account?.substring(account.length - 6)}`;
}

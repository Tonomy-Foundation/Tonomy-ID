export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export function getQueryParam(url: string, name: string): string {
    const urlObject = new URL(url);
    const query = urlObject.searchParams;
    const param = query.get(name);

    if (!param) throw new Error(`Query param ${name} not found in URL ${url}`);
    return param;
}

export function createUrl(baseUrl: string, params: KeyValue): string {
    const url = new URL(baseUrl);

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    return url.toString();
}

export function serializeAny(value: any, verbose = false): string {
    if (value === null) {
        return 'null';
    } else if (value === undefined) {
        return 'undefined';
    } else if (value instanceof Error) {
        let res = value.message || value.toString();

        if (verbose) {
            res += value.stack ? '\n' + value.stack : '';
            const object = JSON.stringify(value, null, 2);

            res += object === '{}' ? '' : '\n' + object;
        }

        return res;
    } else if (Array.isArray(value)) {
        return '[' + value.map((x) => serializeAny(x, verbose)).join(', ') + ']';
    } else if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch (e) {
            return '[Circular]';
        }
    } else if (value.toString) {
        return value.toString();
    } else {
        try {
            return JSON.stringify(value);
        } catch (e) {
            return '[Circular]';
        }
    }
}

export type KeyValue = Record<string, string>;

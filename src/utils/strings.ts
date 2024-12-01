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

export type KeyValue = Record<string, string>;
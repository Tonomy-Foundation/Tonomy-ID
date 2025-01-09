export function formatDate(date: Date): string {
    const day = date.getUTCDate();
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const year = date.getUTCFullYear();

    return `${day} ${month} ${year}`;
}

export function sleep(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

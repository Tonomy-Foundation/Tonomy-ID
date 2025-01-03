export function numberToOrdinal(value: number) {
    let screenNumber;

    if (value === 1) screenNumber = '1st';
    else if (value === 2) screenNumber = '2nd';
    else if (value === 3) screenNumber = '3rd';
    else screenNumber = `${value}th`;

    return screenNumber;
}

export function formatCurrencyValue(value: number, decimalPlaces = 2): string {
    if (value) {
        return value.toLocaleString('en-US', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
        });
    }

    return '0.00';
}

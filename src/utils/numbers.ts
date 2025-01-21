import Decimal from 'decimal.js';

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

export function formatTokenValue(amount: Decimal, maxDecimals = 4): string {
    let formattedAmount: string;
    const decimalPart = amount.toFixed().split('.')[1] || '';

    if (amount.equals(amount.floor())) {
        formattedAmount = amount.toFixed(2);
    } else if (decimalPart.length > maxDecimals) {
        // If the decimal part exceeds maxDecimals, display only maxDecimals decimal places
        formattedAmount = amount.toFixed(maxDecimals, Decimal.ROUND_DOWN);
    } else {
        // If the decimal part is maxDecimals digits or fewer, display as-is
        formattedAmount = amount.toString();
    }

    return formattedAmount;
}

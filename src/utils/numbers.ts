export function numberToOrdinal(value: number) {
    let screenNumber;

    if (value === 1) screenNumber = '1st';
    else if (value === 2) screenNumber = '2nd';
    else if (value === 3) screenNumber = '3rd';
    else screenNumber = `${value}th`;

    return screenNumber;
}

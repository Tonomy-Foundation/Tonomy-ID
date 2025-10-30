export const parseVestingPeriodToMonths = (periodString: string): number => {
    if (!periodString) return 0;

    const lower = periodString.toLowerCase().trim();
    const value = parseFloat(lower);

    if (isNaN(value)) return 0;

    if (lower.includes('second')) {
        return value / (30 * 24 * 60 * 60); // seconds → months
    } else if (lower.includes('hour')) {
        return value / (24 * 30); // hours → months
    } else if (lower.includes('day')) {
        return value / 30; // days → months
    } else if (lower.includes('month')) {
        return value; // already in months
    } else if (lower.includes('year')) {
        return value * 12; // years → months
    }

    return 0;
};

export const calculateMonthlyUnlock = (allocationData) => {
    const initialPercent = allocationData.unlockAtVestingStart * 100;
    const remainingPercent = 100 - initialPercent;

    // Parse string like "6 months", "1 year", "45 days" → number of months
    const vestingMonths = parseVestingPeriodToMonths(allocationData.vestingPeriod);

    // Avoid invalid or zero durations
    if (vestingMonths <= 0) return 0;

    // Calculate monthly unlock percent
    let monthlyUnlockPercent = remainingPercent / vestingMonths;

    // 🔒 Safety check: ensure total unlock <= 100%
    if (initialPercent + monthlyUnlockPercent * vestingMonths > 100) {
        monthlyUnlockPercent = remainingPercent / vestingMonths; // recalc to exact 100 total
    }

    // 🔒 Clamp just in case of rounding errors
    monthlyUnlockPercent = Math.min(monthlyUnlockPercent, remainingPercent);
    return parseFloat(monthlyUnlockPercent.toFixed(2)); // round for display
};

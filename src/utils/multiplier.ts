export const getMultiplier = (allocationDate: Date, category: number): number => {
    // Check the vesting category first
    if (category === 8) {
        return 6;
    } else if (category === 9) {
        return 3;
    } else if (category === 10) {
        return 1;
    }

    // If category is not one of the specified values, check the allocation date
    const seedRoundEndDate = new Date('2025-01-16T14:11:24.000Z');
    const tgeEndDate = new Date('2025-03-31');

    if (allocationDate <= seedRoundEndDate) {
        return 6;
    } else if (allocationDate <= tgeEndDate) {
        return 3;
    } else {
        return 1;
    }
};

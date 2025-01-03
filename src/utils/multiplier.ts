export const getMultiplier = (allocationDate: Date): number | null => {
    const seedRoundEndDate = new Date('2025-02-28');
    const tgeEndDate = new Date('2025-03-31');

    if (allocationDate <= seedRoundEndDate) {
        return 6;
    } else if (allocationDate <= tgeEndDate) {
        return 3;
    } else {
        return null;
    }
};

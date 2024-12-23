export const getMultiplier = (allocationDate: string): number => {
    const seedRoundEndDate = new Date('2024-01-30');
    const tgeEndDate = new Date('2024-03-30');
    const allocationDateObj = new Date(allocationDate);

    if (allocationDateObj <= seedRoundEndDate) {
        return 6;
    } else if (allocationDateObj <= tgeEndDate) {
        return 3;
    } else {
        return 1;
    }
};

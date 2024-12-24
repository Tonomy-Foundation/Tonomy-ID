export const getMultiplier = (): number => {
    const seedRoundEndDate = new Date('2024-01-30');
    const tgeEndDate = new Date('2024-03-30');
    const currentDate = new Date();

    if (currentDate <= seedRoundEndDate) {
        return 6;
    } else if (currentDate <= tgeEndDate) {
        return 3;
    } else {
        return 0;
    }
};

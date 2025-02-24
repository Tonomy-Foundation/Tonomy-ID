import { StakingContract } from '@tonomy/tonomy-id-sdk';

export function formatDate(date: Date): string {
    const day = date.getUTCDate();
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const year = date.getUTCFullYear();

    return `${day} ${month} ${year}`;
}

export function sleep(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export const getStakeUntilDate = () => {
    const date = new Date();

    date.setDate(date.getDate() + StakingContract.getLockedDays());
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const getUnstakeTime = (unstakeTime) => {
    const now = new Date();

    const unstakeableTime = new Date(unstakeTime);
    const daysUntilUnlockable = Math.ceil((unstakeableTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return daysUntilUnlockable;
};

export const getStakeReleaseTime = (stakeReleaseTime) => {
    const now = new Date();

    const stakeReleaseDate = new Date(stakeReleaseTime);
    const daysUntilRelease = Math.ceil((stakeReleaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return daysUntilRelease;
};

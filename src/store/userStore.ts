import create from 'zustand';
import RNKeyManager from '../utils/RNKeyManager';
import { storageFactory } from '../utils/storage';
import settings from '../settings';
import { User, UserStatus, createUserObject, setSettings } from 'tonomy-id-sdk';
import AsynStorage from '@react-native-async-storage/async-storage';

// TODO change this to be an instance of User class when we have implemented the RNKeyStore
// type UserStats ={

// }
export enum StatusData {
    IS_LOGGED_IN,
    CREATING_ACCOUNT,
    NOT_LOGGED_IN,
    LOGGING_IN,
}

interface UserState {
    user: User;
    hasCompletedPin: boolean;
    hasCompletedBiometric: boolean;
    status: StatusData;
    setStatus: (statusData) => void;
    checkPin: () => boolean;
    updatePin: (pinStatus) => void;
    checkBiometric: () => boolean;
    updateBiometric: (bioStatus) => void;
    logout: () => void;
    isLoggedIn: () => Promise<boolean>;
}

setSettings({
    blockchainUrl: settings.config.blockchainUrl,
    accountSuffix: settings.config.accountSuffix,
    communicationUrl: settings.config.communicationUrl,
});

const useUserStore = create<UserState>((set, get) => ({
    user: createUserObject(new RNKeyManager(), storageFactory),

    setStatus: async (statusData) => {
        await AsynStorage.setItem('statusData', String(statusData));
        set({ status: statusData });
    },
    checkBiometric: async () => {
        const data = await AsynStorage.getItem('pinStatus');

        if (!data) return null;
        return JSON.parse(data);
    },
    checkPin: async () => {
        const data = await AsynStorage.getItem('bioStatus');

        if (!data) return null;
        return JSON.parse(data);
    },
    getStatus: async () => {
        const data = await AsynStorage.getItem('statusData');

        if (!data) return null;
        return JSON.parse(data);
    },
    updatePin: async (pinStatus) => {
        set({ hasCompletedPin: pinStatus });
        await AsynStorage.setItem('pinStatus', String(pinStatus));
    },
    updateBiometric: async (bioStatus) => {
        await AsynStorage.setItem('bioStatus', String(bioStatus));
        set({ hasCompletedBiometric: bioStatus });
    },
    isLoggedIn: async () => {
        const status = await get().user.storage.status;

        return status && status === UserStatus.READY;
    },
    logout: async () => {
        await set().user.logout();
    },
}));

export default useUserStore;

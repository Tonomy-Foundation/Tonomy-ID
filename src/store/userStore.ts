import create from 'zustand';
import RNKeyManager from '../utils/RNKeyManager';
import { storageFactory } from '../utils/storage';
import settings from '../settings';
import { User, UserStatus, createUserObject, setSettings } from 'tonomy-id-sdk';
import AsynStorage from '@react-native-async-storage/async-storage';

export enum StatusData {
    IS_LOGGED_IN = 'IS_LOGGED_IN',
    CREATING_ACCOUNT = 'CREATING_ACCOUNT',
    NOT_LOGGED_IN = 'CREATING_ACCOUNT',
    LOGGING_IN = 'LOGGING_IN',
}

interface UserState {
    user: User;
    status: StatusData;
    setStatus: (statusData) => void;
    getPin: () => boolean;
    setPin: (pinStatus) => void;
    getBiometric: () => boolean;
    setBiometric: (bioStatus) => void;
    logout: () => void;
    isLoggedIn: () => Promise<boolean>;
    removeFlags: () => void;
}

setSettings({
    blockchainUrl: settings.config.blockchainUrl,
    accountSuffix: settings.config.accountSuffix,
    communicationUrl: settings.config.communicationUrl,
});

const useUserStore = create<UserState>((set, get) => ({
    user: createUserObject(new RNKeyManager(), storageFactory),

    removeFlags: async () => {
        await AsynStorage.removeItem('pinStatus');
        await AsynStorage.removeItem('bioStatus');
    },
    setStatus: async (statusData) => {
        await AsynStorage.setItem('statusData', String(statusData));
        set({ status: statusData });
    },
    getBiometric: async () => {
        const data = await AsynStorage.getItem('bioStatus');

        if (!data) return null;
        return JSON.parse(data);
    },
    getPin: async () => {
        const data = await AsynStorage.getItem('pinStatus');

        if (!data) return null;
        return JSON.parse(data);
    },
    getStatus: async () => {
        const data = await AsynStorage.getItem('statusData');

        if (!data) return null;
        return JSON.parse(data);
    },
    setPin: async (pinStatus) => {
        await AsynStorage.setItem('pinStatus', String(pinStatus));
    },
    setBiometric: async (bioStatus) => {
        await AsynStorage.setItem('bioStatus', String(bioStatus));
    },
    isLoggedIn: async () => {
        const status = await get().user.storage.status;

        return status && status === UserStatus.READY;
    },
    logout: async () => {
        await get().user.logout();
    },
}));

export default useUserStore;

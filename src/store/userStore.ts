import create from 'zustand';
import RNKeyManager from '../utils/RNKeyManager';
import { storageFactory } from '../utils/storage';
import settings from '../settings';
import { User, createUserObject, setSettings, createStorage } from '@tonomy/tonomy-id-sdk';
import AsynStorage from '@react-native-async-storage/async-storage';

export enum NAVIGATION_STATUS {
    CREATING_ACCOUNT = 'CREATING_ACCOUNT',
    LOGGING_IN = 'LOGGING_IN',
    NONE = 'NONE',
}
export enum UserStatus {
    NONE = 'NONE',
    NOT_LOGGED_IN = 'NOT_LOGGED_IN',
    LOGGED_IN = 'LOGGED_IN',
}

export interface UserState {
    user: User;
    status: UserStatus;
    navigationStatus: NAVIGATION_STATUS;
    getNavigationStatus: () => NAVIGATION_STATUS;
    setNavigationStatus: (navigationStatus) => void;
    getPin: () => boolean;
    setPin: (pinStatus) => void;
    logout: () => void;
    removeFlags: () => void;
    getStatus(): UserStatus;
    setStatus(newStatus: UserStatus): void;
    initializeStatusFromStorage(): Promise<void>;
}

setSettings({
    blockchainUrl: settings.config.blockchainUrl,
    accountSuffix: settings.config.accountSuffix,
    communicationUrl: settings.config.communicationUrl,
});

interface UserStorageState {
    status: UserStatus;
}
const userStorage = createStorage<UserStorageState>('tonomyid.user.', storageFactory);

const useUserStore = create<UserState>((set, get) => ({
    user: createUserObject(new RNKeyManager(), storageFactory),
    status: UserStatus.NONE,

    getNavigationStatus: async (): NAVIGATION_STATUS => {
        const data = await AsynStorage.getItem('navigationStatus');

        if (!data) return NAVIGATION_STATUS.NONE;
        return JSON.parse(data);
    },
    setNavigationStatus: async (navigationStatus: NAVIGATION_STATUS) => {
        await AsynStorage.setItem('navigationStatus', String(navigationStatus));
        set({ navigationStatus: navigationStatus });
    },

    removeFlags: async () => {
        await AsynStorage.removeItem('pinStatus');
        set({ navigationStatus: NAVIGATION_STATUS.NONE });
    },

    getPin: async (): boolean => {
        const data = await AsynStorage.getItem('pinStatus');

        if (!data) return false;
        return JSON.parse(data);
    },
    setPin: async (pinStatus: boolean) => {
        await AsynStorage.setItem('pinStatus', String(pinStatus));
    },
    getStatus: () => {
        const status = get().status;

        return status;
    },
    setStatus: (newStatus: UserStatus) => {
        set({ status: newStatus });

        // Async call to update the status in the storage
        userStorage.status = newStatus;
    },
    initializeStatusFromStorage: async () => {
        let status = await userStorage.status;

        if (!status) status = UserStatus.NONE;

        set({ status: status });
    },
}));

export default useUserStore;

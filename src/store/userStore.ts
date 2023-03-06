import create from 'zustand';
import RNKeyManager from '../utils/RNKeyManager';
import { storageFactory } from '../utils/storage';
import settings from '../settings';
import { User, createUserObject, setSettings, createStorage } from '@tonomy/tonomy-id-sdk';
import AsynStorage from '@react-native-async-storage/async-storage';

export enum RegLogStatus {
    IS_LOGGED_IN = 'IS_LOGGED_IN',
    CREATING_ACCOUNT = 'CREATING_ACCOUNT',
    NOT_LOGGED_IN = 'CREATING_ACCOUNT',
    LOGGING_IN = 'LOGGING_IN',
}
export enum UserStatus {
    NONE = 'NONE',
    NOT_LOGGED_IN = 'NOT_LOGGED_IN',
    LOGGED_IN = 'LOGGED_IN',
}

export interface UserState {
    user: User;
    status: UserStatus;
    regLogStatus: RegLogStatus;
    setRegLogStatus: (regLogStatus) => void;
    getPin: () => boolean;
    setPin: (pinStatus) => void;
    getBiometric: () => boolean;
    setBiometric: (bioStatus) => void;
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

    setRegLogStatus: async (regLogStatus) => {
        await AsynStorage.setItem('statusData', String(regLogStatus));
        set({ regLogStatus: regLogStatus });
    },

    removeFlags: async () => {
        await AsynStorage.removeItem('pinStatus');
        await AsynStorage.removeItem('bioStatus');
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
    setPin: async (pinStatus) => {
        await AsynStorage.setItem('pinStatus', String(pinStatus));
    },
    setBiometric: async (bioStatus) => {
        await AsynStorage.setItem('bioStatus', String(bioStatus));
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

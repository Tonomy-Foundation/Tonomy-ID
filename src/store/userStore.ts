import create from 'zustand';
import RNKeyManager from '../utils/RNKeyManager';
import { storageFactory } from '../utils/storage';
import settings from '../settings';
import { User, createUserObject, setSettings, createStorage } from '@tonomy/tonomy-id-sdk';

export enum UserStatus {
    NONE = 'NONE',
    NOT_LOGGED_IN = 'NOT_LOGGED_IN',
    LOGGED_IN = 'LOGGED_IN',
}

export interface UserState {
    user: User;
    status: UserStatus;
    getStatus(): UserStatus;
    setStatus(newStatus: UserStatus): void;
    initializeStatusFromStorage(): Promise<void>;
    logout(): Promise<void>;
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
        await get().user.intializeFromStorage();

        let status = await userStorage.status;

        if (!status) status = UserStatus.NONE;

        set({ status: status });
    },
    logout: async () => {
        get().setStatus(UserStatus.NOT_LOGGED_IN);
        await get().user.logout();
    },
}));

export default useUserStore;

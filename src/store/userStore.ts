import create from 'zustand';
import RNKeyManager from '../utils/RNKeyManager';
import { storageFactory } from '../utils/storage';
import settings from '../settings';
import {
    User,
    createUserObject,
    setSettings,
    createStorage,
    SdkErrors,
    STORAGE_NAMESPACE,
} from '@tonomy/tonomy-id-sdk';
import useErrorStore from '../store/errorStore';

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
    loggerLevel: settings.config.loggerLevel,
    tonomyIdSchema: settings.config.tonomyIdSchema,
});

interface UserStorageState {
    status: UserStatus;
}
const userStorage = createStorage<UserStorageState>(STORAGE_NAMESPACE + 'store.', storageFactory);

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
    logout: async () => {
        get().setStatus(UserStatus.NOT_LOGGED_IN);
        await get().user.logout();
    },
    initializeStatusFromStorage: async () => {
        try {
            await get().user.intializeFromStorage();
        } catch (e) {
            if (e.code === SdkErrors.KeyNotFound) {
                await get().user.logout();
                useErrorStore.getState().setError({ error: e, expected: false });
            }
        }

        let status = await userStorage.status;

        if (!status) status = UserStatus.NONE;

        set({ status: status });
    },
}));

export default useUserStore;

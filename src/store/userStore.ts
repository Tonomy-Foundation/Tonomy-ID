import create from 'zustand';
import RNKeyManager, { KEY_STORAGE_NAMESPACE } from '../utils/RNKeyManager';
import { storageFactory } from '../utils/storage';
import settings from '../settings';
import {
    User,
    createUserObject,
    setSettings,
    createStorage,
    SdkErrors,
    STORAGE_NAMESPACE,
    SdkError,
    KeyManagerLevel,
} from '@tonomy/tonomy-id-sdk';
import useErrorStore from '../store/errorStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

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
    tonomyIdSchema: settings.config.tonomyIdSlug + '://',
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
        await get().user.logout();
        get().setStatus(UserStatus.NOT_LOGGED_IN);

        await printStorage('logout()');
    },
    initializeStatusFromStorage: async () => {
        await printStorage('initializeStatusFromStorage()');

        try {
            await get().user.intializeFromStorage();
        } catch (e) {
            if (e instanceof SdkError && e.code === SdkErrors.KeyNotFound) {
                await get().logout();
                useErrorStore.getState().setError({ error: e, expected: false });
            }
        }

        let status = await userStorage.status;

        if (!status) status = UserStatus.NONE;

        set({ status: status });
    },
}));

/**
 * Print all AsyncStorage and SecureStore keys
 * Used for debugging
 */
async function printStorage(message: string) {
    if (settings.config.loggerLevel !== 'debug') return;

    const keys = await AsyncStorage.getAllKeys();
    const status = await AsyncStorage.getItem(STORAGE_NAMESPACE + 'store.status');

    console.log(message, 'AsyncStorage keys and status', keys, status);

    const secureKeys: string[] = [];

    for (const level of Object.keys(KeyManagerLevel)) {
        const value = await SecureStore.getItemAsync(KEY_STORAGE_NAMESPACE + level);

        if (value) secureKeys.push(KEY_STORAGE_NAMESPACE + level);
    }

    console.log(message, 'SecureStore keys', secureKeys);
}

export default useUserStore;

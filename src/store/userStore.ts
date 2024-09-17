import { create } from 'zustand';
import RNKeyManager, { KEY_STORAGE_NAMESPACE } from '../utils/RNKeyManager';
import { storageFactory } from '../utils/storage';
import settings from '../settings';
import {
    createUserObject,
    setSettings,
    SdkErrors,
    STORAGE_NAMESPACE,
    SdkError,
    KeyManagerLevel,
    IUser,
} from '@tonomy/tonomy-id-sdk';
import useErrorStore from '../store/errorStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Debug from 'debug';

const debug = Debug('tonomy-id:store:userStore');

export enum UserStatus {
    NONE = 'NONE',
    NOT_LOGGED_IN = 'NOT_LOGGED_IN',
    LOGGED_IN = 'LOGGED_IN',
}

export interface UserState {
    user: IUser;
    status: UserStatus;
    getStatus(): Promise<UserStatus>;
    setStatus(newStatus: UserStatus): void;
    initializeStatusFromStorage(): Promise<void>;
    logout(reason: string): Promise<void>;
    isAppInitialized: boolean;
}

setSettings({
    blockchainUrl: settings.config.blockchainUrl,
    accountSuffix: settings.config.accountSuffix,
    communicationUrl: settings.config.communicationUrl,
    loggerLevel: settings.config.loggerLevel,
    tonomyIdSchema: settings.config.tonomyIdSlug,
    accountsServiceUrl: settings.config.accountsServiceUrl,
    ssoWebsiteOrigin: settings.config.ssoWebsiteOrigin,
});
// setFetch()

const useUserStore = create<UserState>((set, get) => ({
    // @ts-ignore PublicKey type error
    user: createUserObject(new RNKeyManager(), storageFactory),
    status: UserStatus.NONE,
    isAppInitialized: false,
    getStatus: async () => {
        const status = await AsyncStorage.getItem(STORAGE_NAMESPACE + 'store.status');
        const userstatus = get().status;

        get().setStatus(status as UserStatus);

        return status as UserStatus;
    },
    setStatus: async (newStatus: UserStatus) => {
        const storeStatus = await AsyncStorage.setItem(STORAGE_NAMESPACE + 'store.status', newStatus);

        set({ status: newStatus });
    },
    logout: async (reason: string) => {
        await get().user.logout();

        get().setStatus(UserStatus.NOT_LOGGED_IN);

        await printStorage('logout(): ' + reason);
    },
    initializeStatusFromStorage: async () => {
        await printStorage('initializeStatusFromStorage()');

        if (get().isAppInitialized) {
            debug('Already initialized application');
            return;
        }

        try {
            debug('initializeStatusFromStorage() try');
            await get().user.initializeFromStorage();
            get().setStatus(UserStatus.LOGGED_IN);
            set({ isAppInitialized: true });
        } catch (e) {
            if (e instanceof SdkError && e.code === SdkErrors.KeyNotFound) {
                await get().logout('Key not found on account');
                useErrorStore.getState().setError({ error: e, expected: false });
            } else if (e instanceof SdkError && e.code === SdkErrors.AccountDoesntExist) {
                await get().logout('Account not found');
            } else if (e.message === 'Network request failed') {
                const status = await AsyncStorage.getItem(STORAGE_NAMESPACE + 'store.status');

                debug('network error condition status', status);

                get().setStatus(status as UserStatus);

                throw e;
            } else {
                console.error('initializeStatusFromStorage error ', e);
            }
        }
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

    debug(message, 'AsyncStorage keys and status', keys, status);

    const secureKeys: string[] = [];

    for (const level of Object.keys(KeyManagerLevel)) {
        const value = await SecureStore.getItemAsync(KEY_STORAGE_NAMESPACE + level);

        if (value) secureKeys.push(KEY_STORAGE_NAMESPACE + level);
    }

    debug(message, 'SecureStore keys', secureKeys);
}

export default useUserStore;

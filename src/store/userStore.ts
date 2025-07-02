import { create } from 'zustand';
import RNKeyManager, { KEY_STORAGE_NAMESPACE } from '../utils/RNKeyManager';
import { storageFactory } from '../utils/storage';
import {
    createUserObject,
    SdkErrors,
    STORAGE_NAMESPACE,
    SdkError,
    KeyManagerLevel,
    isErrorCode,
    IUser,
} from '@tonomy/tonomy-id-sdk';
import useErrorStore from '../store/errorStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Debug from 'debug';
import useWalletStore from './useWalletStore';
import { setUser } from '../utils/sentry';

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

const useUserStore = create<UserState>((set, get) => ({
    user: null as unknown as IUser,
    status: UserStatus.NONE,
    isAppInitialized: false,
    getStatus: async () => {
        const storageStatus = await AsyncStorage.getItem(STORAGE_NAMESPACE + 'store.status');

        debug('getStatus() storageStatus', storageStatus);

        if (storageStatus) {
            const userStatus = storageStatus as UserStatus;

            set({ status: userStatus });
            return userStatus;
        } else {
            const stateStatus = get().status;

            get().setStatus(stateStatus);
            return stateStatus;
        }
    },
    setStatus: async (newStatus: UserStatus) => {
        await AsyncStorage.setItem(STORAGE_NAMESPACE + 'store.status', newStatus);

        set({ status: newStatus });
    },
    logout: async (reason: string) => {
        await get().user.logout();
        if (get().status === UserStatus.LOGGED_IN) get().setStatus(UserStatus.NOT_LOGGED_IN);
        useWalletStore.getState().clearState();
        setUser(null);
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
            // Create the user object asynchronously
            const user = await createUserObject(new RNKeyManager(), storageFactory);

            set({ user });

            await user.initializeFromStorage();
            setUser({
                id: (await user.getAccountName()).toString(),
                username: '@' + (await user.getUsername()).getBaseUsername(),
            });
            set({ isAppInitialized: true });
        } catch (e) {
            debug('initializeStatusFromStorage() catch', e, typeof e);

            if (isErrorCode(e, SdkErrors.KeyNotFound)) {
                await get().logout('Key not found on account');
                set({ isAppInitialized: true });
                useErrorStore.getState().setError({ error: e, expected: false });
            } else if (isErrorCode(e, SdkErrors.AccountDoesntExist)) {
                await get().logout('Account not found');
                set({ isAppInitialized: true });
            } else {
                debug('Unexpected error during initializeStatusFromStorage()', e);
                throw e;
            }
        }
    },
}));

/**
 * Print all AsyncStorage and SecureStore keys
 * Used for debugging
 */
async function printStorage(message: string) {
    const keys = await AsyncStorage.getAllKeys();

    const status = await AsyncStorage.getItem(STORAGE_NAMESPACE + 'store.status');

    debug(message, 'AsyncStorage keys and status', keys, status);

    const secureKeys: string[] = [];

    for (const level of Object.keys(KeyManagerLevel)) {
        debug(KEY_STORAGE_NAMESPACE + level);
        const value = await SecureStore.getItemAsync(KEY_STORAGE_NAMESPACE + level);

        if (value) secureKeys.push(KEY_STORAGE_NAMESPACE + level);
    }

    debug(message, 'SecureStore keys', secureKeys);
}

export default useUserStore;

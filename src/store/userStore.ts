import create from 'zustand';
import RNKeyManager from '../utils/RNKeyManager';
import { storageFactory } from '../utils/storage';
import settings from '../settings';
import { User, UserStatus, createUserObject, setSettings } from 'tonomy-id-sdk';

// TODO change this to be an instance of User class when we have implemented the RNKeyStore
// type UserStats ={

// }
type statusData = 'isLoggedIn' | 'creatingAccount' | 'NotLoggedIn' | 'LoggingIn';
interface UserState {
    user: User;
    hasCompletedPin: boolean;
    hasCompletedBiometric: boolean;
    status: statusData;
    getStatus: () => statusData;
    setStatus: (statusData) => void;
    checkPin: () => boolean;
    updatePin: (pin) => void;
    checkBiometric: () => boolean;
    updateBiometric: (pin) => void;
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

    setStatus: (statusData) => {
        set((state) => ({ ...state, status: statusData }));
    },
    checkBiometric: () => {
        return get().hasCompletedBiometric;
    },
    checkPin: () => {
        return get().hasCompletedPin;
    },

    getStatus: () => {
        return get().status;
    },
    updatePin: () => {
        set((state) => ({ ...state, hasCompletedPin: true }));
    },
    updateBiometric: () => {
        set((state) => ({ ...state, hasCompletedBiometric: true }));
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

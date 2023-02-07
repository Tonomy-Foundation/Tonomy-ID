import create from 'zustand';
import RNKeyManager from '../utils/RNKeyManager';
import { storageFactory } from '../utils/storage';
import settings from '../settings';
import { User, UserStatus, createUserObject, setSettings } from 'tonomy-id-sdk';

// TODO change this to be an instance of User class when we have implemented the RNKeyStore
interface UserState {
    user: User;
    isLoggedIn: () => Promise<boolean>;
}

setSettings({
    blockchainUrl: settings.config.blockchainUrl,
    accountSuffix: settings.config.accountSuffix,
    communicationUrl: settings.config.communicationUrl,
});

const useUserStore = create<UserState>((set, get) => ({
    user: createUserObject(new RNKeyManager(), storageFactory),

    isLoggedIn: async () => {
        const status = await get().user.storage.status;
        return status && status === UserStatus.READY;
    },

    logout: async () => {
        await get().user.logout();
    },
}));

export default useUserStore;

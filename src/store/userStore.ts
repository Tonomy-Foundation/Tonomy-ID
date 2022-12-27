import create from 'zustand';
import RNKeyManager from '../utils/RNKeyManager';
import { storageFactory } from '../utils/storage';
import settings from '../settings';
import { User, UserStatus, createUserObject, setSettings } from 'tonomy-id-sdk';

// TODO change this to be an instance of User class when we have implemented the RNKeyStore
interface UserState {
    username: string | null;
    user: User;
    isLoggedIn: () => Promise<boolean>;
}

setSettings({
    blockchainUrl: settings.config.blockchainUrl,
    accountSuffix: settings.config.accountSuffix,
});

const useUserStore = create<UserState>((set, get) => ({
    username: null, // start by getting the username from tonomy persistent storage
    user: createUserObject(new RNKeyManager(), storageFactory),

    isLoggedIn: async () => {
        const status = await get().user.storage.status;
        return status && status === UserStatus.READY;
    },
}));

export default useUserStore;

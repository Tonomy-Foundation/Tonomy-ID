import create from 'zustand';
import RNKeyManager from '../utils/RNKeyManager';
import { initialize, User, SettingsType, UserStatus } from 'tonomy-id-sdk';
import Storage from '../utils/storage';
import settings from '../settings';

// TODO change this to be an instance of User class when we have implemented the RNKeyStore
interface UserState {
    user: User;
    isLoggedIn: () => Promise<boolean>;
}

const sdkSettings: SettingsType = {
    blockchainUrl: settings.config.blockchainUrl,
};

const useUserStore = create<UserState>((set, get) => ({
    user: initialize(new RNKeyManager(), new Storage(), sdkSettings),

    isLoggedIn: async () => {
        const status = await get().user.storage.status;
        return status && status === UserStatus.READY;
    },
}));

export default useUserStore;

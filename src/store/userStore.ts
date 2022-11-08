import create from 'zustand';
import RNKeyManager from '../utils/RNKeyManager';
import Storage from '../utils/storage';
import settings from '../settings';
import { User, SettingsType, UserStatus } from 'tonomy-id-sdk';
const { initialize } = settings.sdk;
// TODO change this to be an instance of User class when we have implemented the RNKeyStore
interface UserState {
    username: string | null;
    user: User;
    isLoggedIn: () => Promise<boolean>;
}

const sdkSettings: SettingsType = {
    blockchainUrl: settings.config.blockchainUrl,
};

const useUserStore = create<UserState>((set, get) => ({
    username: null, // start by getting the username from tonomy persistent storage
    user: initialize(new RNKeyManager(), new Storage(), sdkSettings),

    isLoggedIn: async () => {
        const status = await get().user.storage.status;
        return status && status === UserStatus.READY;
    },
}));

export default useUserStore;

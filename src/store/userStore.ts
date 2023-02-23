import create from 'zustand';
import RNKeyManager from '../utils/RNKeyManager';
import { storageFactory } from '../utils/storage';
import settings from '../settings';
import { User, UserStatus, createUserObject, setSettings } from 'tonomy-id-sdk';

// TODO change this to be an instance of User class when we have implemented the RNKeyStore
export interface UserState {
    user: User;
}

setSettings({
    blockchainUrl: settings.config.blockchainUrl,
    accountSuffix: settings.config.accountSuffix,
    communicationUrl: settings.config.communicationUrl,
});

const useUserStore = create<UserState>((set, get) => ({
    user: createUserObject(new RNKeyManager(), storageFactory),
}));

export default useUserStore;

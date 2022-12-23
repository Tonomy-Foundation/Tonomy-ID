import create from 'zustand';
import { createStorage } from 'tonomy-id-sdk';
import { storageFactory } from '../utils/storage';

interface SplashState {
    finishedSplash: boolean;
}

const useSplashStore = createStorage<SplashState>('tonomyid.splash.', storageFactory);

export default useSplashStore;

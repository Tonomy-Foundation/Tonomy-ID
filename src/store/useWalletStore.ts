// useWalletStore.js
import create from 'zustand';
import { ICore } from '@walletconnect/types';
import { IWeb3Wallet } from '@walletconnect/web3wallet';

interface WalletState {
    privateKey: string | null;
    initialized: boolean;
    web3wallet: IWeb3Wallet | null;
    core: ICore | null;
    currentETHAddress: string | null;
    setWeb3wallet: (wallet: IWeb3Wallet | null) => void;
    setCore: (core: ICore | null) => void;
    setCurrentETHAddress: (address: string | null) => void;
    setInitialized: (initialized: boolean) => void;
    setPrivateKey: (privateKey: string | null) => void;
}

const useWalletStore = create<WalletState>((set) => ({
    initialized: false,
    web3wallet: null,
    core: null,
    currentETHAddress: null,
    privateKey: null,
    setWeb3wallet: (web3wallet) => set({ web3wallet }),
    setCore: (core) => set({ core }),
    setCurrentETHAddress: (currentETHAddress) => set({ currentETHAddress }),
    setInitialized: (initialized) => set({ initialized }),
    setPrivateKey: (privateKey) => set({ privateKey }),
}));

export default useWalletStore;

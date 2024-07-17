// useWalletStore.js
import create from 'zustand';
import { Core } from '@walletconnect/core';
import Web3Wallet, { IWeb3Wallet } from '@walletconnect/web3wallet';
import { appStorage, connect, keyStorage } from '../utils/StorageManager/setup';
import settings from '../settings';
import {
    EthereumAccount,
    EthereumMainnetChain,
    EthereumPrivateKey,
    EthereumSepoliaChain,
    ETHSepoliaToken,
    ETHToken,
} from '../utils/chain/etherum';
import { Asset, IAccount } from '../utils/chain/types';

export const core = new Core({
    projectId: settings.config.walletConnectProjectId,
    relayUrl: 'wss://relay.walletconnect.com',
});

interface WalletState {
    privateKey: string | null;
    initialized: boolean;
    web3wallet: IWeb3Wallet | null;
    account: IAccount | null;
    balance: Asset | null;
    initializeWalletState: () => Promise<void>;
    clearState: () => Promise<void>; // Ensure clearState returns a Promise
}

const useWalletStore = create<WalletState>((set, get) => ({
    initialized: false,
    web3wallet: null,
    account: null,
    privateKey: null,
    balance: null,
    initializeWalletState: async () => {
        try {
            await connect();
            const ethereumKey = await keyStorage.findByName('ethereum');

            if (get().initialized) console.log('Already initialized.');
            else if (ethereumKey && !get().initialized) {
                const exportPrivateKey = await ethereumKey.exportPrivateKey();
                const ethereumPrivateKey = new EthereumPrivateKey(exportPrivateKey);

                let ethereumAccount, balance;

                if (settings.isProduction()) {
                    ethereumAccount = await EthereumAccount.fromPublicKey(
                        EthereumMainnetChain,
                        await ethereumPrivateKey.getPublicKey()
                    );
                    balance = await ETHToken.getBalance(ethereumAccount);
                } else {
                    ethereumAccount = await EthereumAccount.fromPublicKey(
                        EthereumSepoliaChain,
                        await ethereumPrivateKey.getPublicKey()
                    );
                    balance = await ETHSepoliaToken.getBalance(ethereumAccount);
                }

                const web3wallet = await Web3Wallet.init({
                    core,
                    metadata: {
                        name: settings.config.appName,
                        description: settings.config.ecosystemName,
                        url: 'https://walletconnect.com/',
                        icons: [settings.config.images.logo48],
                    },
                });

                set({
                    initialized: true,
                    privateKey: exportPrivateKey,
                    web3wallet,
                    account: ethereumAccount,
                    balance: balance,
                });
            } else {
                console.warn('No Ethereum key found.');
                set({
                    initialized: false,
                    privateKey: null,
                    web3wallet: null,
                    account: null,
                    balance: null,
                });
            }
        } catch (error) {
            console.error('Error initializing wallet state:', error);
            set({
                initialized: false,
                privateKey: null,
                web3wallet: null,
                account: null,
                balance: null,
            });
        }
    },
    clearState: async () => {
        try {
            await keyStorage.deleteAll();
            await appStorage.deleteAll();
            set({
                initialized: false,
                privateKey: null,
                web3wallet: null,
                account: null,
            });
        } catch (error) {
            console.error('Error clearing wallet state:', error);
        }
    },
}));

export default useWalletStore;

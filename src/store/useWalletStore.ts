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
    ethereumPrivateKey: string | null;
    initialized: boolean;
    web3wallet: IWeb3Wallet | null;
    ethereumAccount: IAccount | null;
    ethereumBalance: Asset | null;
    sepoliaAccount: IAccount | null;
    sepoliaBalance: Asset | null;
    initializeWalletState: () => Promise<void>;
    clearState: () => Promise<void>;
    updateBalance: () => Promise<void>;
}

const useWalletStore = create<WalletState>((set, get) => ({
    initialized: false,
    web3wallet: null,
    ethereumAccount: null,
    ethereumPrivateKey: null,
    ethereumBalance: null,
    sepoliaAccount: null,
    sepoliaBalance: null,
    initializeWalletState: async () => {
        try {
            await connect();

            if (get().initialized) console.log('Already initialized.');

            const ethereumKey = await keyStorage.findByName('ethereum');
            const sepoliaKey = await keyStorage.findByName('sepolia');

            if (ethereumKey && !get().ethereumAccount) {
                const exportPrivateKey = await ethereumKey.exportPrivateKey();
                const ethereumPrivateKey = new EthereumPrivateKey(exportPrivateKey);

                const ethereumAccount = await EthereumAccount.fromPublicKey(
                    EthereumMainnetChain,
                    await ethereumPrivateKey.getPublicKey()
                );
                const ethereumBalance = await ETHToken.getBalance(ethereumAccount);

                set({
                    ethereumBalance,
                    ethereumAccount,
                    ethereumPrivateKey: exportPrivateKey,
                });
            }

            if (sepoliaKey && !get().sepoliaAccount) {
                const exportPrivateKey = await sepoliaKey.exportPrivateKey();
                const sepoliaPrivateKey = new EthereumPrivateKey(exportPrivateKey);

                const sepoliaAccount = await EthereumAccount.fromPublicKey(
                    EthereumSepoliaChain,
                    await sepoliaPrivateKey.getPublicKey()
                );

                const sepoliaBalance = await ETHSepoliaToken.getBalance(sepoliaAccount);

                set({
                    sepoliaBalance,
                    sepoliaAccount,
                });
            }

            if (!get().initialized) {
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
                    web3wallet,
                });
            }
        } catch (error) {
            console.error('Error initializing wallet state:', error);
            set({
                initialized: false,
                ethereumPrivateKey: null,
                web3wallet: null,
                ethereumAccount: null,
                ethereumBalance: null,
                sepoliaAccount: null,
                sepoliaBalance: null,
            });
        }
    },
    clearState: async () => {
        try {
            await keyStorage.deleteAll();
            await appStorage.deleteAll();
            set({
                initialized: false,
                ethereumPrivateKey: null,
                web3wallet: null,
                ethereumAccount: null,
                ethereumBalance: null,
                sepoliaAccount: null,
                sepoliaBalance: null,
            });
        } catch (error) {
            console.error('Error clearing wallet state:', error);
        }
    },
    updateBalance: async () => {
        try {
            const { ethereumAccount, sepoliaAccount } = get();

            if (ethereumAccount) {
                const ethereumBalance = await ETHToken.getBalance(ethereumAccount);

                set({
                    ethereumBalance,
                });
            }

            if (sepoliaAccount) {
                const sepoliaBalance = await ETHSepoliaToken.getBalance(sepoliaAccount);

                set({
                    sepoliaBalance,
                });
            }
        } catch (error) {
            console.error('Error updating balance:', error);
        }
    },
}));

export default useWalletStore;

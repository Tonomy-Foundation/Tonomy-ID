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

export const core = new Core({
    projectId: settings.config.walletConnectProjectId,
    relayUrl: 'wss://relay.walletconnect.com',
});

interface WalletState {
    privateKey: string | null;
    initialized: boolean;
    web3wallet: IWeb3Wallet | null;
    currentETHAddress: string | null;
    accountBalance: string | null;
    usdBalance: string | null;
    initializeWalletState: () => Promise<void>;
    clearState: () => void;
}

const useWalletStore = create<WalletState>((set) => ({
    initialized: false,
    web3wallet: null,
    currentETHAddress: null,
    privateKey: null,
    usdBalance: null,
    accountBalance: null,
    initializeWalletState: async () => {
        try {
            await connect();
            const ethereumKey = await keyStorage.findByName('ethereum');

            if (ethereumKey) {
                const web3wallet = await Web3Wallet.init({
                    core,
                    metadata: {
                        name: settings.config.appName,
                        description: settings.config.ecosystemName,
                        url: 'https://walletconnect.com/',
                        icons: [settings.config.images.logo48],
                    },
                });
                const exportPrivateKey = await ethereumKey.exportPrivateKey();
                const ethereumPrivateKey = new EthereumPrivateKey(exportPrivateKey);

                let ethereumAccount, balance, usdBalance;

                if (settings.env === 'production') {
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
                    usdBalance = await ETHSepoliaToken.getUsdValue(ethereumAccount);
                }

                set({
                    initialized: true,
                    privateKey: exportPrivateKey,
                    web3wallet: web3wallet,
                    currentETHAddress: ethereumAccount.getName(),
                    accountBalance: balance.toString(),
                    usdBalance,
                });
            } else {
                set({
                    initialized: true,
                    privateKey: null,
                    web3wallet: null,
                    currentETHAddress: null,
                    accountBalance: null,
                    usdBalance: null,
                });
            }
        } catch (error) {
            console.error('Error initializing wallet state:', error);
            set({
                initialized: false,
                privateKey: null,
                web3wallet: null,
                currentETHAddress: null,
                accountBalance: null,
                usdBalance: null,
            });
        }
    },
    clearState: async () => {
        await keyStorage.deleteAll();
        await appStorage.deleteAll();
        set({
            initialized: false,
            privateKey: null,
            web3wallet: null,
            currentETHAddress: null,
        });
    },
}));

export default useWalletStore;

// useWalletStore.js
import create from 'zustand';
import { Core } from '@walletconnect/core';
import Web3Wallet, { IWeb3Wallet } from '@walletconnect/web3wallet';
import { appStorage, connect, keyStorage } from '../utils/StorageManager/setup';
import settings from '../settings';
import {
    EthereumAccount,
    EthereumMainnetChain,
    EthereumPolygonChain,
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
    polygonAccount: IAccount | null;
    polygonBalance: Asset | null;
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
    polygonAccount: null,
    polygonBalance: null,
    initializeWalletState: async () => {
        try {
            await connect();
            const ethereumKey = await keyStorage.findByName('ethereum');
            const sepoliaKey = await keyStorage.findByName('ethereumTestnetSepolia');
            const polygonKey = await keyStorage.findByName('polygon');

            if (get().initialized) console.log('Already initialized.');
            else if (!get().initialized && ethereumKey && sepoliaKey && polygonKey) {
                const exportPrivateKey = await ethereumKey.exportPrivateKey();
                const ethereumPrivateKey = new EthereumPrivateKey(exportPrivateKey);

                const ethereumAccount = await EthereumAccount.fromPublicKey(
                    EthereumMainnetChain,
                    await ethereumPrivateKey.getPublicKey()
                );
                const ethereumBalance = await ETHToken.getBalance(ethereumAccount);

                const exportSepoliaPrivateKey = await sepoliaKey.exportPrivateKey();
                const sepoliaPrivateKey = new EthereumPrivateKey(exportSepoliaPrivateKey);

                const sepoliaAccount = await EthereumAccount.fromPublicKey(
                    EthereumSepoliaChain,
                    await sepoliaPrivateKey.getPublicKey()
                );

                const sepoliaBalance = await ETHSepoliaToken.getBalance(sepoliaAccount);

                const exportPolygonPrivateKey = await polygonKey.exportPrivateKey();
                const polygonPrivateKey = new EthereumPrivateKey(exportPolygonPrivateKey);

                const polygonAccount = await EthereumAccount.fromPublicKey(
                    EthereumPolygonChain,
                    await polygonPrivateKey.getPublicKey()
                );
                const polygonBalance = await ETHToken.getBalance(polygonAccount);

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
                    ethereumBalance,
                    ethereumAccount,
                    sepoliaBalance,
                    sepoliaAccount,
                    polygonBalance,
                    polygonAccount,
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
                polygonAccount: null,
                polygonBalance: null,
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
                polygonAccount: null,
                polygonBalance: null,
            });
        } catch (error) {
            console.error('Error clearing wallet state:', error);
        }
    },
    updateBalance: async () => {
        try {
            const { ethereumAccount, sepoliaAccount, polygonAccount } = get();

            if (ethereumAccount && sepoliaAccount && polygonAccount) {
                const ethereumBalance = await ETHToken.getBalance(ethereumAccount);

                const sepoliaBalance = await ETHSepoliaToken.getBalance(sepoliaAccount);

                const polygonBalance = await ETHToken.getBalance(polygonAccount);

                set({
                    ethereumBalance,
                    sepoliaBalance,
                    polygonBalance,
                });
            }
        } catch (error) {
            console.error('Error updating balance:', error);
        }
    },
}));

export default useWalletStore;

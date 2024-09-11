// useWalletStore.js
import { create } from 'zustand';
import { Core } from '@walletconnect/core';
import Web3Wallet, { IWeb3Wallet } from '@walletconnect/web3wallet';
import { appStorage, assetStorage, connect, keyStorage } from '../utils/StorageManager/setup';
import settings from '../settings';
import {
    EthereumAccount,
    EthereumChain,
    EthereumMainnetChain,
    EthereumPolygonChain,
    EthereumPrivateKey,
    EthereumSepoliaChain,
    ETHPolygonToken,
    ETHSepoliaToken,
    ETHToken,
    EthereumToken,
} from '../utils/chain/etherum';
import { Asset, IAccount } from '../utils/chain/types';
import Debug from 'debug';

const debug = Debug('tonomy-id:store:useWalletStore');

export const core = new Core({
    projectId: settings.config.walletConnectProjectId,
    relayUrl: 'wss://relay.walletconnect.com',
});

interface WalletState {
    initialized: boolean;
    web3wallet: IWeb3Wallet | null;
    ethereumAccount: IAccount | null;
    sepoliaAccount: IAccount | null;
    polygonAccount: IAccount | null;
    initializeWalletState: () => Promise<void>;
    clearState: () => Promise<void>;
    updateBalance: () => Promise<void>;
    disconnectSession: () => Promise<void>;
    refreshBalance: boolean;
    initializeWalletAccount: () => Promise<void>;
    accountExists: boolean;
}
const defaultState = {
    initialized: false,
    ethereumAccount: null,
    sepoliaAccount: null,
    polygonAccount: null,
    web3wallet: null,
    refreshBalance: false,
    accountExists: false,
};

const useWalletStore = create<WalletState>((set, get) => ({
    ...defaultState,
    initializeWalletState: async () => {
        if (get().initialized) {
            debug('Already initialized');
            return;
        }

        if (!get().initialized && !get().web3wallet) {
            debug('initialize wallet condition');

            try {
                const web3wallet = await Web3Wallet.init({
                    core,
                    metadata: {
                        name: settings.config.appName,
                        description: settings.config.ecosystemName,
                        url: 'https://walletconnect.com/',
                        icons: [settings.config.images.logo48],
                    },
                });

                debug('web3wallet', web3wallet);
                set({
                    initialized: true,
                    web3wallet,
                });
            } catch (e) {
                debug("error wallet initialization'", e);

                if (e.message === 'Network request failed') {
                    debug('network error when initializing wallet');
                } else {
                    throw e;
                }
            }
        }
    },

    initializeWalletAccount: async () => {
        debug('initializeWalletAccount');
        await connect();

        const state = get();
        const fetchAccountData = async (chain: EthereumChain, token: EthereumToken, keyName: string) => {
            debug('fetchAccountData', keyName);
            const key = await keyStorage.findByName(keyName, chain);

            if (key) {
                debug('key exists');
                const asset = await assetStorage.findAssetByName(token);

                let account;

                if (!asset) {
                    const exportPrivateKey = await key.exportPrivateKey();
                    const privateKey = new EthereumPrivateKey(exportPrivateKey, chain);

                    account = await EthereumAccount.fromPublicKey(chain, await privateKey.getPublicKey());
                    const abstractAsset = new Asset(token, BigInt(0));

                    await assetStorage.createAsset(abstractAsset, account);
                } else {
                    account = new EthereumAccount(chain, asset.accountName);
                }

                debug(`account ${account}`);
                return {
                    account,
                };
            }

            return null;
        };
        const [ethereumData, sepoliaData, polygonData] = await Promise.allSettled([
            fetchAccountData(EthereumMainnetChain, ETHToken, 'ethereum'),
            fetchAccountData(EthereumSepoliaChain, ETHSepoliaToken, 'ethereumTestnetSepolia'),
            fetchAccountData(EthereumPolygonChain, ETHPolygonToken, 'ethereumPolygon'),
        ]);

        debug('fetchAccountData', ethereumData);

        if (ethereumData.status === 'fulfilled' && ethereumData.value) {
            state.ethereumAccount = ethereumData.value.account;
        }

        if (sepoliaData.status === 'fulfilled' && sepoliaData.value) {
            state.sepoliaAccount = sepoliaData.value.account;
        }

        if (polygonData.status === 'fulfilled' && polygonData.value) {
            state.polygonAccount = polygonData.value.account;
        }

        debug('fetchAccountData', get().accountExists, state.accountExists, state.ethereumAccount);

        if (!get().accountExists) {
            debug(
                `iff account not exists set statet',
                ${state.ethereumAccount},
                ${state.sepoliaAccount},
                ${state.polygonAccount}`
            );
            set({
                ethereumAccount: state.ethereumAccount,
                sepoliaAccount: state.sepoliaAccount,
                polygonAccount: state.polygonAccount,
                accountExists: true,
            });
        }
    },

    clearState: async () => {
        debug('clearState');

        try {
            await keyStorage.deleteAll();
            await appStorage.deleteAll();
            await assetStorage.deleteAll();
            set({
                initialized: false,
                web3wallet: null,
                ethereumAccount: null,
                sepoliaAccount: null,
                polygonAccount: null,
                accountExists: false,
            });
        } catch (error) {
            console.error('Error clearing wallet state:', error);
        }
    },
    updateBalance: async () => {
        try {
            const { ethereumAccount, sepoliaAccount, polygonAccount } = get();

            debug(` updateBalance', ${ethereumAccount}`);

            if (ethereumAccount && sepoliaAccount && polygonAccount) {
                set({ refreshBalance: true });
                const balances = await Promise.allSettled([
                    ETHToken.getBalance(ethereumAccount),
                    ETHSepoliaToken.getBalance(sepoliaAccount),
                    ETHPolygonToken.getBalance(polygonAccount),
                ]);

                const [ethereumResult, sepoliaResult, polygonResult] = balances;

                const ethereumBalance = ethereumResult.status === 'fulfilled' ? ethereumResult.value : 0;
                const sepoliaBalance = sepoliaResult.status === 'fulfilled' ? sepoliaResult.value : 0;
                const polygonBalance = polygonResult.status === 'fulfilled' ? polygonResult.value : 0;

                if (ethereumBalance) {
                    await assetStorage.updateAccountBalance(ethereumBalance);
                }

                if (sepoliaBalance) {
                    await assetStorage.updateAccountBalance(sepoliaBalance);
                }

                if (polygonBalance) {
                    await assetStorage.updateAccountBalance(polygonBalance);
                }

                set({ refreshBalance: false });
            }
        } catch (error) {
            console.error('Error updating balance:', error);
        }
    },
    disconnectSession: async () => {
        set({
            initialized: false,
            web3wallet: null,
        });
    },
}));

export default useWalletStore;

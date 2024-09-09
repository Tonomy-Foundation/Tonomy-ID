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
}
const defaultState = {
    initialized: false,
    ethereumAccount: null,
    sepoliaAccount: null,
    polygonAccount: null,
    web3wallet: null,
    refreshBalance: false,
};

const useWalletStore = create<WalletState>((set, get) => ({
    ...defaultState,
    initializeWalletState: async () => {
        try {
            await connect();

            if (get().initialized && get().ethereumAccount) {
                debug('Already initialized');
                return;
            }

            const state = get();
            const fetchAccountData = async (chain: EthereumChain, token: EthereumToken, keyName: string) => {
                const key = await keyStorage.findByName(keyName, chain);

                if (key) {
                    const exportPrivateKey = await key.exportPrivateKey();
                    const privateKey = new EthereumPrivateKey(exportPrivateKey, chain);
                    const account = await EthereumAccount.fromPublicKey(chain, await privateKey.getPublicKey());

                    try {
                        const balance = await token.getBalance(account);

                        await assetStorage.emplaceAccountBalance(keyName, {
                            balance: balance.toString(),
                            usdBalance: await balance.getUsdValue(),
                        });
                    } catch (e) {
                        debug('Error getting balance:', e);

                        if (e.message === 'Network request failed') {
                            debug('network error do nothing');
                        } else {
                            await assetStorage.emplaceAccountBalance(keyName, {
                                balance: '0',
                                usdBalance: 0,
                            });
                            throw e;
                        }
                    }

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

            if (ethereumData.status === 'fulfilled' && ethereumData.value) {
                state.ethereumAccount = ethereumData.value.account;
            }

            if (sepoliaData.status === 'fulfilled' && sepoliaData.value) {
                state.sepoliaAccount = sepoliaData.value.account;
            }

            if (polygonData.status === 'fulfilled' && polygonData.value) {
                state.polygonAccount = polygonData.value.account;
            }

            if (!get().ethereumAccount && !get().sepoliaAccount && !get().polygonAccount) {
                set({
                    ethereumAccount: state.ethereumAccount,
                    sepoliaAccount: state.sepoliaAccount,
                    polygonAccount: state.polygonAccount,
                });
            }

            if (!get().initialized && !get().web3wallet) {
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
                ethereumAccount: null,
                sepoliaAccount: null,
                polygonAccount: null,
            });
        }
    },

    clearState: async () => {
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
            });
        } catch (error) {
            console.error('Error clearing wallet state:', error);
        }
    },
    updateBalance: async () => {
        try {
            const { ethereumAccount, sepoliaAccount, polygonAccount } = get();

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
                    await assetStorage.emplaceAccountBalance('ethereum', {
                        balance: ethereumBalance.toString(),
                        usdBalance: await ethereumBalance.getUsdValue(),
                    });
                }

                if (sepoliaBalance) {
                    await assetStorage.emplaceAccountBalance('ethereumTestnetSepolia', {
                        balance: sepoliaBalance.toString(),
                        usdBalance: await sepoliaBalance.getUsdValue(),
                    });
                }

                if (polygonBalance) {
                    await assetStorage.emplaceAccountBalance('ethereumPolygon', {
                        balance: polygonBalance.toString(),
                        usdBalance: await polygonBalance.getUsdValue(),
                    });
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

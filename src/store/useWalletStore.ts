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
import { ICore } from '@walletconnect/types';
import NetInfo from '@react-native-community/netinfo';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '../utils/errors';

const debug = Debug('tonomy-id:store:useWalletStore');

export interface WalletState {
    initialized: boolean;
    web3wallet: IWeb3Wallet | null;
    core: ICore | null;
    ethereumAccount: IAccount | null;
    sepoliaAccount: IAccount | null;
    polygonAccount: IAccount | null;
    initializeWalletState: () => Promise<void>;
    clearState: () => Promise<void>;
    updateBalance: () => Promise<void>;
    disconnectSession: () => Promise<void>;
    initializeWalletAccount: () => Promise<void>;
    accountExists: boolean;
}

const defaultState = {
    initialized: false,
    ethereumAccount: null,
    sepoliaAccount: null,
    polygonAccount: null,
    web3wallet: null,
    accountExists: false,
    core: null,
};

const useWalletStore = create<WalletState>((set, get) => ({
    ...defaultState,
<<<<<<< HEAD

    async initializeWalletState(): Promise<void> {
        try {
            await connect();
            debug('initialize');
=======
    initializeWalletState: async () => {
        if (get().initialized) {
            debug('initializeWalletState() Already initialized');
            return;
        }
>>>>>>> development

        const netInfoState = await NetInfo.fetch();

        if (!netInfoState.isConnected) {
            throw new Error(NETWORK_ERROR_MESSAGE);
        }

        if (!get().initialized && !get().web3wallet) {
            try {
                let core: ICore;

                try {
                    core = new Core({
                        projectId: settings.config.walletConnectProjectId,
                        relayUrl: 'wss://relay.walletconnect.com',
                    });
                } catch (e) {
                    console.error('useWalletStore() error when constructing Core', e);
                    if (!(e instanceof Error)) {
                        throw new Error(JSON.stringify(e));
                    } else throw e;
                }

                let web3walletInstance: IWeb3Wallet;

                try {
                    web3walletInstance = await Web3Wallet.init({
                        core,
                        metadata: {
                            name: settings.config.appName,
                            description: settings.config.ecosystemName,
                            url: 'https://walletconnect.com/',
                            icons: [settings.config.images.logo48],
                        },
                    });
                } catch (e) {
                    console.error('useWalletStore() error on Web3Wallet.init()', JSON.stringify(e, null, 2));
                    if (e.msg && e.msg.includes('No internet connection')) throw new Error(NETWORK_ERROR_MESSAGE);
                    else throw e;
                }

                set({
                    initialized: true,
                    web3wallet: web3walletInstance,
                    core,
                });
            } catch (e) {
                console.error('useWalletStore() initializeWalletState()', e);
            }
        }
    },

    initializeWalletAccount: async () => {
        try {
            const state = get();

            if (get().accountExists) {
                debug('initializeWalletAccount() Account already exists');
                return;
            }

<<<<<<< HEAD
            debug('Starting state initialization');
            const state = get();

            debug('Current state:', state);

            const fetchAccountData = async (chain: EthereumChain, token: EthereumToken, keyName: string) => {
                try {
                    const key = await keyStorage.findByName(keyName, chain);

                    if (!key) {
                        return null;
                    }

                    const exportPrivateKey = await key.exportPrivateKey();
                    const privateKey = new EthereumPrivateKey(exportPrivateKey, chain);
                    const account = await EthereumAccount.fromPublicKey(chain, await privateKey.getPublicKey());
                    //TODO uncomment after fix the antelope chain PR
                    // const balance = await token.getBalance(account);

                    // console.log('Account data:', { account, balance });
                    return {
                        account,
                        balance: {
                            balance: '0',
                            usdBalance: 0,
                        },
                    };
                } catch (error) {
=======
            await connect();

            const fetchAccountData = async (chain: EthereumChain, token: EthereumToken, keyName: string) => {
                try {
                    const key = await keyStorage.findByName(keyName, chain);

                    if (key) {
                        const asset = await assetStorage.findAssetByName(token);

                        let account: EthereumAccount;

                        if (!asset) {
                            const exportPrivateKey = await key.exportPrivateKey();
                            const privateKey = new EthereumPrivateKey(exportPrivateKey, chain);

                            account = await EthereumAccount.fromPublicKey(chain, await privateKey.getPublicKey());
                            const abstractAsset = new Asset(token, BigInt(0));

                            await assetStorage.createAsset(abstractAsset, account);
                        } else {
                            account = new EthereumAccount(chain, asset.accountName);
                        }

                        return {
                            account,
                        };
                    }

                    return null;
                } catch (error) {
                    debug(`fetchAccountData() Error fetching account data for ${keyName} on ${chain}:`, error);
                    // Return a null or custom object to indicate failure
>>>>>>> development
                    return null;
                }
            };

            const [ethereumData, sepoliaData, polygonData] = await Promise.allSettled([
                fetchAccountData(EthereumMainnetChain, ETHToken, 'ethereum'),
                fetchAccountData(EthereumSepoliaChain, ETHSepoliaToken, 'ethereumTestnetSepolia'),
                fetchAccountData(EthereumPolygonChain, ETHPolygonToken, 'ethereumPolygon'),
            ]);

            if (ethereumData.status === 'fulfilled' && ethereumData.value) {
                state.ethereumAccount = ethereumData.value.account;
            } else if (ethereumData.status === 'rejected') {
                debug('initializeWalletAccount() Failed to fetch Ethereum account data:', ethereumData.reason);
            }

            if (sepoliaData.status === 'fulfilled' && sepoliaData.value) {
                state.sepoliaAccount = sepoliaData.value.account;
            } else if (sepoliaData.status === 'rejected') {
                debug('initializeWalletAccount() Failed to fetch Sepolia account data:', sepoliaData.reason);
            }

            if (polygonData.status === 'fulfilled' && polygonData.value) {
                state.polygonAccount = polygonData.value.account;
            } else if (polygonData.status === 'rejected') {
                debug('initializeWalletAccount() Failed to fetch Polygon account data:', polygonData.reason);
            }

            if (!get().accountExists) {
                set({
                    ethereumAccount: state.ethereumAccount,
                    sepoliaAccount: state.sepoliaAccount,
                    polygonAccount: state.polygonAccount,
                    accountExists: true,
                });
            }
        } catch (error) {
<<<<<<< HEAD
            debug('Error initializing wallet state:', error);
            set({
                ethereumAccount: null,
                ethereumBalance: { balance: '0', usdBalance: 0 },
                sepoliaAccount: null,
                sepoliaBalance: { balance: '0', usdBalance: 0 },
                polygonAccount: null,
                polygonBalance: { balance: '0', usdBalance: 0 },
            });
=======
            if (isNetworkError(error)) {
                debug('initializeWalletAccount() network error when initializing wallet account');
            } else {
                throw error;
            }
>>>>>>> development
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
                accountExists: false,
                core: null,
            });
        } catch (error) {
            console.error('useWalletStore() Error clearing wallet state:', error);
        }
    },
    updateBalance: async () => {
        const { ethereumAccount, sepoliaAccount, polygonAccount } = get();

        debug('updateBalance() Updating account balance');

        if (ethereumAccount && sepoliaAccount && polygonAccount) {
            await connect();
            debug('updateBalance() fetching sepolia account', sepoliaAccount.getName());
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
        }
    },
    disconnectSession: async () => {
        set({
            initialized: false,
            web3wallet: null,
            core: null,
        });
    },
}));

export default useWalletStore;

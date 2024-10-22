// useWalletStore.js
import { create } from 'zustand';
import { Core } from '@walletconnect/core';
import Web3Wallet, { IWeb3Wallet } from '@walletconnect/web3wallet';
import { assetStorage, connect, keyStorage } from '../utils/StorageManager/setup';
import settings from '../settings';
import { IAccount } from '../utils/chain/types';
import Debug from 'debug';
import { ICore } from '@walletconnect/types';
import NetInfo from '@react-native-community/netinfo';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '../utils/errors';
import { chainRegistry, ChainRegistryEntry, getAccountFromChain, getChainEntryByName } from '../utils/assetDetails';
import useUserStore from './userStore';

const debug = Debug('tonomy-id:store:useWalletStore');

export interface WalletState {
    initialized: boolean;
    web3wallet: IWeb3Wallet | null;
    core: ICore | null;
    accounts: (IAccount | null)[];
    accountsInitialized: boolean;
    initializeWalletState: () => Promise<void>;
    clearState: () => Promise<void>;
    updateBalance: () => Promise<void>;
    disconnectSession: () => Promise<void>;
    initializeWalletAccount: () => Promise<void>;
}

const defaultState = {
    initialized: false,
    accounts: [],
    accountsInitialized: false,
    web3wallet: null,
    core: null,
};

const useWalletStore = create<WalletState>((set, get) => ({
    ...defaultState,
    initializeWalletState: async () => {
        if (get().initialized) {
            debug('initializeWalletState() Already initialized');
            return;
        }

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
            if (get().accountsInitialized) {
                debug('initializeWalletAccount() Account already exists');
                return;
            }

            await connect();

            const accountPromises = chainRegistry.map(
                async (chainEntry: ChainRegistryEntry): Promise<IAccount | null> => {
                    try {
                        const { user } = useUserStore();

                        return getAccountFromChain(chainEntry, user);
                    } catch (error) {
                        debug(`fetchAccountData() Error fetching account data`, error);
                        return null;
                    }
                }
            );

            const accounts = await Promise.all(accountPromises);

            set({
                accounts,
                accountsInitialized: true,
            });
        } catch (error) {
            if (isNetworkError(error)) {
                debug('initializeWalletAccount() network error when initializing accounts');
            } else {
                throw error;
            }
        }
    },

    clearState: async () => {
        try {
            await connect();

            await keyStorage.deleteAll();
            await assetStorage.deleteAll();
            set({
                initialized: false,
                web3wallet: null,
                accounts: [],
                accountsInitialized: false,
                core: null,
            });
        } catch (error) {
            debug('useWalletStore() Error clearing wallet state:', error);
        }
    },
    updateBalance: async () => {
        const { accounts, accountsInitialized } = get();

        if (accountsInitialized) {
            await connect();
            await Promise.all(
                accounts.map(async (account: IAccount | null) => {
                    if (!account) return;
                    debug(`updateBalance() fetching account ${account.getChain().getName()} ${account.getName()}`);
                    const chainRegistryEntry = await getChainEntryByName(account.getChain().getName());

                    try {
                        const balance = await chainRegistryEntry.token.getBalance(account);

                        await assetStorage.updateAccountBalance(balance);
                    } catch (error) {
                        debug('updateBalance() Error updating balance:', error);
                    }
                })
            );
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

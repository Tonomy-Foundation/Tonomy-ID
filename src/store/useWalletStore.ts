// useWalletStore.js
import { create } from 'zustand';
import { Core } from '@walletconnect/core';
import Web3Wallet, { IWeb3Wallet } from '@walletconnect/web3wallet';
import { assetStorage, connect, keyStorage } from '../utils/StorageManager/setup';
import settings from '../settings';
import { IAccount, IChain } from '../utils/chain/types';
import DebugAndLog from '../utils/debug';
import { ICore } from '@walletconnect/types';
import NetInfo from '@react-native-community/netinfo';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '../utils/errors';
import { captureError } from '../utils/sentry';
import { tokenRegistry, TokenRegistryEntry, getAccountFromChain, getTokenEntryByChain } from '../utils/tokenRegistry';
import { IUser } from '@tonomy/tonomy-id-sdk';

const debug = DebugAndLog('tonomy-id:store:useWalletStore');

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
    initializeWalletAccount: (user: IUser) => Promise<void>;
}

// Create a proper token store for assets, accounts and keys components can subscribe to
// TODO:
// change accounts to AccountTokenDetails
// initialize on login / create account
// CreateEthereumKeys screen
// add getter functions to retrieve correct account based on chain
// move cron job here
// pangeaActive check where used and other tokenRegistry functions

const useWalletStore = create<WalletState>((set, get) => ({
    initialized: false,
    accounts: [],
    accountsInitialized: false,
    web3wallet: null,
    core: null,
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
                    captureError('useWalletStore() error when constructing Core', e);
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
                    captureError('useWalletStore() error on Web3Wallet.init()', e);
                    if (e.msg && e.msg.includes('No internet connection')) throw new Error(NETWORK_ERROR_MESSAGE);
                    else throw e;
                }

                set({
                    initialized: true,
                    web3wallet: web3walletInstance,
                    core,
                });
            } catch (e) {
                captureError('useWalletStore() initializeWalletState()', e);
            }
        }
    },
    initializeWalletAccount: async (user: IUser) => {
        try {
            if (get().accountsInitialized) {
                debug('initializeWalletAccount() Account already initialized');
                return;
            }

            await connect();

            const accountPromises = tokenRegistry.map(
                async (tokenEntry: TokenRegistryEntry): Promise<IAccount | null> => {
                    debug(`initializeWalletAccount() fetching ${tokenEntry.chain.getName()} account data`);

                    try {
                        return getAccountFromChain(tokenEntry, user);
                    } catch (error) {
                        debug(
                            `initializeWalletAccount() Error fetching ${tokenEntry.chain.getName()} account data`,
                            error
                        );
                        return null;
                    }
                }
            );

            const accounts = await Promise.all(accountPromises);

            debug(`initializeWalletAccount() accounts: ${accounts}`);

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

        debug(`updateBalance() accountsInitialized: ${accountsInitialized}, ${accounts}`);

        if (accountsInitialized) {
            await connect();

            await Promise.all(
                accounts.map(async (account: IAccount | null) => {
                    try {
                        if (!account) return;
                        debug(`updateBalance() fetching account 0`);
                        const chain = account.getChain();

                        debug(`updateBalance() fetching account ${chain.getName()}`);

                        try {
                            const { token } = await getTokenEntryByChain(chain);
                            const balance = await token.getBalance(account);

                            await assetStorage.updateAccountBalance(balance);
                        } catch (error) {
                            captureError(`updateBalance() Error fetching balance ${chain.getName()}`, error, 'warning');
                        }
                    } catch (error) {
                        captureError(`updateBalance() Error updating balance:`, error);
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

interface ChainWalletStore {
    account: IAccount | null;
}

export const createChainWalletStore = (chain: IChain) => {
    return create<ChainWalletStore>(() => {
        const { accounts } = useWalletStore();
        const chainAccount = accounts.find((account) => account?.getChain() === chain);

        if (!chainAccount) throw new Error(`Account not found for ${chain.getName()}`);

        return {
            account: chainAccount,
        };
    });
};

export default useWalletStore;

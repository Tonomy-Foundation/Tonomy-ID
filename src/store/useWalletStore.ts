// useWalletStore.js
import { create } from 'zustand';
import { IWeb3Wallet } from '@walletconnect/web3wallet';
import { assetStorage, checkReposExists, keyStorage } from '../utils/StorageManager/setup';
import { IAccount, IChain } from '../utils/chain/types';
import Debug from 'debug';
import { ICore } from '@walletconnect/types';
import { isNetworkError } from '../utils/errors';
import { captureError } from '../utils/sentry';
import { tokenRegistry, TokenRegistryEntry, getAccountFromChain, getTokenEntryByChain } from '../utils/tokenRegistry';
import { IUser } from '@tonomy/tonomy-id-sdk';

const debug = Debug('tonomy-id:store:useWalletStore');

export interface WalletState {
    initialized: boolean;
    web3wallet: IWeb3Wallet | null;
    core: ICore | null;
    accounts: (IAccount | null)[];
    accountsInitialized: boolean;
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
    initializeWalletAccount: async (user: IUser) => {
        try {
            if (get().accountsInitialized) {
                debug('initializeWalletAccount() Account already initialized');
                return;
            }

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

            debug(
                `initializeWalletAccount() accounts: ${accounts.map(
                    (account) => `${account?.getChain().getName()}: ${account?.getName()}`
                )}`
            );

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
            const isExists = await checkReposExists();

            if (isExists) {
                await keyStorage.deleteAll();
                await assetStorage.deleteAll();
            }

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

        debug(
            `updateBalance() accountsInitialized: ${accountsInitialized}, ${accounts.map(
                (account) => `${account?.getChain().getName()}: ${account?.getName()}`
            )}`
        );

        if (accountsInitialized) {
            await Promise.all(
                accounts.map(async (account: IAccount | null) => {
                    try {
                        if (!account) return;
                        const chain = account.getChain();

                        try {
                            const { token } = await getTokenEntryByChain(chain);
                            const balance = await token.getBalance(account);

                            await assetStorage.updateAccountBalance(balance);
                        } catch (error) {
                            if (isNetworkError(error)) {
                                debug(`updateBalance() Network error fetching balance ${chain.getName()}`);
                            } else {
                                captureError(
                                    `updateBalance() Error fetching balance ${chain.getName()}:`,
                                    error,
                                    'warning'
                                );
                            }
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

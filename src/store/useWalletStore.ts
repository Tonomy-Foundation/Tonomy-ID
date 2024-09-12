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

        try {
            await connect();

            const state = get();
            const fetchAccountData = async (chain: EthereumChain, token: EthereumToken, keyName: string) => {
                debug('fetchAccountData', keyName);
                const key = await keyStorage.findByName(keyName, chain);

                if (key) {
                    debug('key exists', key);

                    try {
                        const asset = await assetStorage.findAssetByName(token);

                        debug('asset', asset);
                        // let account;

                        // if (!asset) {
                        //     const exportPrivateKey = await key.exportPrivateKey();
                        //     const privateKey = new EthereumPrivateKey(exportPrivateKey, chain);

                        //     account = await EthereumAccount.fromPublicKey(chain, await privateKey.getPublicKey());
                        //     const abstractAsset = new Asset(token, BigInt(0));

                        //     await assetStorage.createAsset(abstractAsset, account);
                        // } else {
                        //     account = new EthereumAccount(chain, asset.accountName);
                        // }

                        return {
                            account: new EthereumAccount(chain, '0x989EF35990Eb70564A8551BcA45B354d28B69e8F'),
                        };
                    } catch (error) {
                        if (error.message === 'Network request failed') {
                            debug('network error when calling fetch account data');
                           
                        } else {
                            debug('error when calling fetch account data', JSON.stringify(error, null, 2));
                        }
                        return null;
                    }
                }

                return null;
            };
           
            const ethereumData = await fetchAccountData(EthereumMainnetChain, ETHToken, 'ethereum');


            debug('ethereumData', ethereumData);
            if(ethereumData) {
                set({
                    ethereumAccount: ethereumData.account,
                    // sepoliaAccount: state.sepoliaAccount,
                    // polygonAccount: state.polygonAccount,
                    accountExists: true,
                });
            }

            //ethereumData, polygonData
             const [ sepoliaData] = await Promise.allSettled([
                // fetchAccountData(EthereumMainnetChain, ETHToken, 'ethereum'),
                fetchAccountData(EthereumSepoliaChain, ETHSepoliaToken, 'ethereumTestnetSepolia'),
                // fetchAccountData(EthereumPolygonChain, ETHPolygonToken, 'ethereumPolygon'),
            ]);

            // if (ethereumData.status === 'fulfilled' && ethereumData.value) {
            //     state.ethereumAccount = ethereumData.value.account;
            // }
            let sepoliaAccount: IAccount | null = null;
            if (sepoliaData.status === 'fulfilled' && sepoliaData.value) {
                sepoliaAccount = sepoliaData.value.account;
            } else if (sepoliaData.status === 'rejected') {
                debug('sepoliaData promise rejected', sepoliaData.reason);
            } else {
                debug('sepoliaData promise not fulfilled');
            }
            if(sepoliaAccount) {
                debug('sepoliaAccount', sepoliaAccount);
            }

            // if (polygonData.status === 'fulfilled' && polygonData.value) {
            //     state.polygonAccount = polygonData.value.account;
            // }


            // if (!get().accountExists) {
            //     debug(
            //         `iff account not exists set statet',
            //     ${state.ethereumAccount},
            //     ${state.sepoliaAccount},
            //     ${state.polygonAccount}`
            //     );
            //     set({
            //         ethereumAccount: state.ethereumAccount,
            //         sepoliaAccount: state.sepoliaAccount,
            //         polygonAccount: state.polygonAccount,
            //         accountExists: true,
            //     });
            // }
        } catch (error) {
            if (error.message === 'Network request failed') {
                debug('network error when initializing wallet account');
            }
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

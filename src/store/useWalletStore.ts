// useWalletStore.js
import create from 'zustand';
import { Core } from '@walletconnect/core';
import Web3Wallet, { IWeb3Wallet } from '@walletconnect/web3wallet';
import { appStorage, connect, keyStorage } from '../utils/StorageManager/setup';
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
import { IAccount } from '../utils/chain/types';

export const core = new Core({
    projectId: settings.config.walletConnectProjectId,
    relayUrl: 'wss://relay.walletconnect.com',
});

interface WalletState {
    initialized: boolean;
    web3wallet: IWeb3Wallet | null;
    ethereumAccount: IAccount | null;
    ethereumBalance: { balance: string; usdBalance: number };
    sepoliaAccount: IAccount | null;
    sepoliaBalance: { balance: string; usdBalance: number };
    polygonAccount: IAccount | null;
    polygonBalance: { balance: string; usdBalance: number };
    initializeWalletState: () => Promise<void>;
    clearState: () => Promise<void>;
    updateBalance: () => Promise<void>;
    disconnectSession: () => Promise<void>;
}
const defaultState = {
    initialized: false,
    ethereumAccount: null,
    ethereumBalance: { balance: '0', usdBalance: 0 },
    sepoliaAccount: null,
    sepoliaBalance: { balance: '0', usdBalance: 0 },
    polygonAccount: null,
    polygonBalance: { balance: '0', usdBalance: 0 },
    web3wallet: null,
};

const useWalletStore = create<WalletState>((set, get) => ({
    ...defaultState,
    initializeWalletState: async () => {
        try {
            await connect();

            if (get().initialized && get().ethereumAccount) {
                console.log('Already initialized');
                return;
            }

            const state = get();
            const fetchAccountData = async (chain: EthereumChain, token: EthereumToken, keyName: string) => {
                const key = await keyStorage.findByName(keyName, chain);

                if (key) {
                    const exportPrivateKey = await key.exportPrivateKey();
                    const privateKey = new EthereumPrivateKey(exportPrivateKey, chain);
                    const account = await EthereumAccount.fromPublicKey(chain, await privateKey.getPublicKey());
                    const balance = await token.getBalance(account);

                    return {
                        account,
                        balance: {
                            balance: balance.toString(),
                            usdBalance: (await balance.getUsdValue()) || 0,
                        },
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
                state.ethereumBalance = ethereumData.value.balance;
            }

            if (sepoliaData.status === 'fulfilled' && sepoliaData.value) {
                state.sepoliaAccount = sepoliaData.value.account;
                state.sepoliaBalance = sepoliaData.value.balance;
            }

            if (polygonData.status === 'fulfilled' && polygonData.value) {
                state.polygonAccount = polygonData.value.account;
                state.polygonBalance = polygonData.value.balance;
            }

            if (!get().ethereumAccount && !get().sepoliaAccount && !get().polygonAccount) {
                set({
                    ethereumAccount: state.ethereumAccount,
                    ethereumBalance: state.ethereumBalance,
                    sepoliaAccount: state.sepoliaAccount,
                    sepoliaBalance: state.sepoliaBalance,
                    polygonAccount: state.polygonAccount,
                    polygonBalance: state.polygonBalance,
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
                ethereumBalance: { balance: '0', usdBalance: 0 },
                sepoliaAccount: null,
                sepoliaBalance: { balance: '0', usdBalance: 0 },
                polygonAccount: null,
                polygonBalance: { balance: '0', usdBalance: 0 },
            });
        }
    },

    clearState: async () => {
        try {
            await keyStorage.deleteAll();
            await appStorage.deleteAll();
            set({
                initialized: false,
                web3wallet: null,
                ethereumAccount: null,
                ethereumBalance: { balance: '0', usdBalance: 0 },
                sepoliaAccount: null,
                sepoliaBalance: { balance: '0', usdBalance: 0 },
                polygonAccount: null,
                polygonBalance: { balance: '0', usdBalance: 0 },
            });
        } catch (error) {
            console.error('Error clearing wallet state:', error);
        }
    },
    updateBalance: async () => {
        try {
            const { ethereumAccount, sepoliaAccount, polygonAccount } = get();

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

                set({
                    ethereumBalance: {
                        balance: ethereumBalance.toString(),
                        usdBalance: ethereumBalance ? (await ethereumBalance.getUsdValue()) || 0 : 0,
                    },
                    sepoliaBalance: {
                        balance: sepoliaBalance.toString(),
                        usdBalance: sepoliaBalance ? (await sepoliaBalance.getUsdValue()) || 0 : 0,
                    },
                    polygonBalance: {
                        balance: polygonBalance.toString(),
                        usdBalance: polygonBalance ? (await polygonBalance.getUsdValue()) || 0 : 0,
                    },
                });
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

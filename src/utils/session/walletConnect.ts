import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { Core } from '@walletconnect/core';
import Web3Wallet from '@walletconnect/web3wallet';
import NetInfo from '@react-native-community/netinfo';
import { ICore, SessionTypes, SignClientTypes } from '@walletconnect/types';
import Debug from 'debug';
import { NETWORK_ERROR_MESSAGE } from '../../utils/errors';
import settings from '../../settings';
import {
    AbstractSession,
    Asset,
    IAccount,
    IChain,
    ILoginApp,
    ILoginRequest,
    ISession,
    ITransactionRequest,
} from '../chain/types';
import { getChainIds, hasUnsupportedChains } from './helper';
import { getSdkError } from '@walletconnect/utils';
import { supportedChains } from '../assetDetails';
import { assetStorage, keyStorage } from '../StorageManager/setup';
import {
    EthereumAccount,
    EthereumChain,
    EthereumPrivateKey,
    EthereumToken,
    EthereumTransactionReceipt,
} from '../chain/etherum';
import { navigate } from '../../services/NavigationService';

const debug = Debug('tonomy-id:utils:session:walletConnect');

export class WalletConnectLoginApp implements ILoginApp {
    name: string;
    url: string;
    icons: string;
    chains: IChain[];
    origin: string;

    constructor(name: string, url: string, icons: string, chains: IChain[]) {
        this.name = name;
        this.url = url;
        this.icons = icons;
        this.chains = chains;
        this.origin = new URL(url).origin;
    }
    getLogoUrl(): string {
        return this.icons;
    }
    getName(): string {
        return this.name;
    }
    getChains(): IChain[] {
        return this.chains;
    }
    getOrigin(): string {
        return this.origin;
    }
    getUrl(): string {
        return this.url;
    }
}

export class WalletLoginRequest implements ILoginRequest {
    loginApp: ILoginApp;
    account: IAccount[];
    request: SignClientTypes.EventArguments['session_proposal'];
    session: ISession;
    namespaces: SessionTypes.Namespaces;

    constructor(
        loginApp: ILoginApp,
        accounts: IAccount[],
        request: SignClientTypes.EventArguments['session_proposal'],
        session: ISession,
        namespaces: SessionTypes.Namespaces
    ) {
        this.loginApp = loginApp;
        this.account = accounts;
        this.request = request;
        this.session = session;
        this.namespaces = namespaces;
    }

    getLoginApp(): ILoginApp {
        return this.loginApp;
    }
    getAccount(): IAccount[] {
        return this.account;
    }
    getRequest(): SignClientTypes.EventArguments['session_proposal'] {
        return this.request;
    }
    async reject(): Promise<void> {
        await this.session.web3wallet?.rejectSession({
            id: this.request.id,
            reason: getSdkError('USER_REJECTED'),
        });
    }

    async approve(): Promise<void> {
        await this.session.web3wallet?.approveSession({
            id: this.request.id,
            namespaces: this.namespaces,
        });
    }
}

export class WalletConnectSession extends AbstractSession {
    core: ICore;
    initialized: boolean;
    web3wallet: Web3Wallet;

    async initialize(): Promise<void> {
        console.log('initialize wallet connect session');
        const netInfoState = await NetInfo.fetch();

        if (!netInfoState.isConnected) {
            throw new Error(NETWORK_ERROR_MESSAGE);
        }

        if (!this.initialized && !this.web3wallet) {
            this.core = new Core({
                projectId: settings.config.walletConnectProjectId,
                relayUrl: 'wss://relay.walletconnect.com',
            });

            try {
                this.web3wallet = await Web3Wallet.init({
                    core: this.core,
                    metadata: {
                        name: settings.config.appName,
                        description: settings.config.ecosystemName,
                        url: 'https://walletconnect.com/',
                        icons: [settings.config.images.logo48],
                    },
                });

                this.initialized = true;
            } catch (e) {
                console.log('Error initializing WalletConnect:', e);
                if (e.msg && e.msg.includes('No internet connection')) throw new Error(NETWORK_ERROR_MESSAGE);
                else throw e;
            }
        }
    }

    async onQrScan(data: string): Promise<void> {
        debug(`onQrScan() data ${data}`);

        // Handle QR code scan specific to Ethereum here
    }

    async onLink(data: string): Promise<void> {
        debug(`Link received with data: ${data}`);
        // Handle link data specific to Ethereum here
    }
    async onEvent(): Promise<void> {
        this.web3wallet?.on('session_proposal', async (proposal) => {
            await this.handleLoginRequest(proposal);
        });
    }

    private async getChainAccount(chainIds: string[]): Promise<IAccount[]> {
        const accounts: IAccount[] = [];

        for (const chainId of chainIds) {
            const supportedChain = supportedChains.find(({ chain }) => chain.getChainId() === chainId);

            if (!supportedChain) throw new Error('Chain not supported');
            const key = await keyStorage.findByName(supportedChain.keyName, supportedChain.chain);

            if (!key) throw new Error('Key not found');

            const asset = await assetStorage.findAssetByName(supportedChain.token);
            let account: EthereumAccount;

            if (!asset) {
                const exportPrivateKey = await key.exportPrivateKey();
                const privateKey = new EthereumPrivateKey(exportPrivateKey, supportedChain.chain);

                account = await EthereumAccount.fromPublicKey(supportedChain.chain, await privateKey.getPublicKey());
                const abstractAsset = new Asset(supportedChain.token, BigInt(0));

                await assetStorage.createAsset(abstractAsset, account);
            } else {
                account = new EthereumAccount(supportedChain.chain, asset.accountName);
            }

            accounts.push(account);
        }

        return accounts;
    }

    protected async handleLoginRequest(request: SignClientTypes.EventArguments['session_proposal']): Promise<void> {
        const {
            id,
            params: { requiredNamespaces, optionalNamespaces },
        } = request;
        const activeNamespaces = Object.keys(requiredNamespaces).length ? requiredNamespaces : optionalNamespaces;
        const chainIds = getChainIds(activeNamespaces);

        if (hasUnsupportedChains(chainIds)) {
            await this.web3wallet.rejectSession({
                id: id,
                reason: getSdkError('UNSUPPORTED_CHAINS'),
            });
            throw new Error('We currently support Ethereum Mainnet, Sepolia Testnet, and Polygon Mainnet.');
        } else {
            const namespaces: SessionTypes.Namespaces = {};

            const accounts = await this.getChainAccount(chainIds);

            Object.keys(activeNamespaces).forEach((key) => {
                const accountsDetails: string[] = [];

                activeNamespaces[key].chains?.forEach((chain) => {
                    const chainId = chain.split(':')[1];

                    const chainDetail = accounts?.find((account) => account.getChain().getChainId() === chainId);

                    if (!chainDetail) throw new Error(`Account not found for chainId ${chainId}`);
                    accountsDetails.push(`${chain}:${chainDetail.getName()}`);
                });
                namespaces[key] = {
                    chains: activeNamespaces[key].chains,
                    accounts: accountsDetails,
                    methods: activeNamespaces[key].methods,
                    events: activeNamespaces[key].events,
                };
            });
            const { name, url, icons } = request?.params?.proposer?.metadata ?? {};
            const chains = accounts.map((account) => account.getChain());

            const loginApp = new WalletConnectLoginApp(name, url, icons?.[0], chains);
            const loginRequest = new WalletLoginRequest(loginApp, accounts, request, this, namespaces);

            this.navigateToLoginScreen(loginRequest);
        }
    }

    protected async handleTransactionRequest(
        request: SignClientTypes.EventArguments['session_request']
    ): Promise<void> {
        debug(`Handling transaction request:`, request);
        // Handle Ethereum-specific transaction request
    }

    protected async navigateToLoginScreen(request: ILoginRequest): Promise<void> {
        navigate('WalletConnectLogin', { loginRequest: request });
    }

    protected async navigateToTransactionScreen(request: ITransactionRequest): Promise<void> {
        debug(`Navigating to transaction screen with amount: ${request}`);
        // Logic to navigate to the Ethereum transaction screen
    }

    protected async navigateToGenerateKey(request: unknown): Promise<void> {
        debug(`Navigating to transaction screen with amount: ${request}`);
        // Logic to navigate to the Ethereum transaction screen
    }
}

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
    ChainType,
    IAccount,
    IChain,
    ILoginApp,
    ILoginRequest,
    IPrivateKey,
    ISession,
    ITransaction,
    ITransactionReceipt,
    ITransactionRequest,
} from '../chain/types';
import { getSdkError } from '@walletconnect/utils';
import { assetStorage, keyStorage } from '../StorageManager/setup';
import {
    EthereumAccount,
    EthereumChain,
    EthereumPrivateKey,
    EthereumToken,
    EthereumTransaction,
    EthereumTransactionReceipt,
} from '../chain/etherum';
import { navigate } from '../../services/NavigationService';
import {
    eip155StringToChainId,
    findEthereumTokenByChainId,
    getAccountFromChain,
    getKeyFromChain,
    getKeyOrNullFromChain,
    tokenRegistry,
} from '../tokenRegistry';

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

export class WalletTransactionRequest implements ITransactionRequest {
    transaction: ITransaction;
    privateKey: IPrivateKey;
    account: IAccount;
    request?: SignClientTypes.EventArguments['session_request'];
    session?: ISession;
    origin: string;

    constructor(
        transaction: ITransaction,
        privateKey: IPrivateKey,
        account: IAccount,
        session?: ISession,
        request?: SignClientTypes.EventArguments['session_request']
    ) {
        this.transaction = transaction;
        this.privateKey = privateKey;
        this.account = account;
        this.request = request;
        this.session = session;
    }

    setOrigin(origin: string | null): void {
        this.origin = origin ?? '';
    }

    getOrigin(): string {
        return this.origin;
    }

    async reject(): Promise<void> {
        if (this.request && this.session) {
            const response = {
                id: this.request.id,
                error: getSdkError('USER_REJECTED'),
                jsonrpc: '2.0',
            };

            await this.session.web3wallet?.respondSessionRequest({
                topic: this.request.topic,
                response,
            });
        } else throw new Error('Session or request is not defined');
    }

    async approve(receipt: ITransactionReceipt): Promise<ITransactionReceipt> {
        if (this.request && this.session) {
            const signedTransaction = receipt.getRawReceipt();
            const response = { id: this.request.id, result: signedTransaction, jsonrpc: '2.0' };

            await this.session.web3wallet?.respondSessionRequest({ topic: this.request.topic, response });
            return receipt;
        } else throw new Error('Session or request is not defined');
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
        this.web3wallet?.on('session_request', async (proposal) => {
            await this.handleTransactionRequest(proposal);
        });
    }

    private async getChainAccount(chainIds: string[]): Promise<IAccount[]> {
        const accounts: IAccount[] = [];

        for (const chainId of chainIds) {
            const token = tokenRegistry.find((c) => c.chain.getChainId() === chainId);

            if (token) {
                const key = await keyStorage.findByName(token.keyName, token.chain);

                const account = await EthereumAccount.fromPublicKey(
                    token.chain as EthereumChain,
                    await (key as EthereumPrivateKey).getPublicKey()
                );

                accounts.push(account);
            }
        }

        return accounts;
    }

    protected async handleLoginRequest(request: SignClientTypes.EventArguments['session_proposal']): Promise<void> {
        const {
            id,
            params: { requiredNamespaces, optionalNamespaces },
        } = request;
        const activeNamespaces = Object.keys(requiredNamespaces).length ? requiredNamespaces : optionalNamespaces;

        const chainIds = activeNamespaces.eip155.chains?.map(eip155StringToChainId) || [];

        // Step 1: find any of the chainIds that is not an Ethereum chain in the registry
        const unsupportedChain = chainIds.find((chainId) => !findEthereumTokenByChainId(chainId));

        if (unsupportedChain) {
            await this.web3wallet.rejectSession({
                id: id,
                reason: getSdkError('UNSUPPORTED_CHAINS'),
            });
            throw new Error('We currently support Ethereum Mainnet, Sepolia Testnet, and Polygon Mainnet.');
        } else {
            // Step 2: Check for any missing keys
            for (const chainId of chainIds) {
                const chainEntry = findEthereumTokenByChainId(chainId);

                if (chainEntry) {
                    const key = await getKeyOrNullFromChain(chainEntry);

                    if (!key) {
                        // navigation.navigate('CreateEthereumKey', {
                        //     requestType: 'loginRequest',
                        //     payload: proposal,
                        //     session,
                        // });
                        // return;
                    }
                }
            }

            // Step 3: Find the accounts for the session
            const namespaces: SessionTypes.Namespaces = {};

            const accounts = await this.getChainAccount(chainIds);

            const ethereumAccounts = accounts
                .filter((account) => account !== null)
                .filter((account) => account.getChain().getChainType() === ChainType.ETHEREUM) as EthereumAccount[];

            Object.keys(activeNamespaces).forEach((key) => {
                const accounts: string[] = [];

                activeNamespaces[key].chains?.forEach((chain) => {
                    const chainId = chain.split(':')[1];

                    const ethereumAccount = ethereumAccounts.find(
                        (account) => account.getChain().getChainId() === chainId
                    );

                    if (!ethereumAccount) throw new Error(`Account not found for chainId ${chainId}`);
                    accounts.push(`${chain}:${ethereumAccount.getName()}`);
                });
                namespaces[key] = {
                    chains: activeNamespaces[key].chains,
                    accounts,
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

    protected async handleTransactionRequest(event: SignClientTypes.EventArguments['session_request']): Promise<void> {
        debug(`Handling transaction request:`, event);
        const { topic, params, id, verifyContext } = event;
        const { request, chainId } = params;

        switch (request.method) {
            case 'eth_sendTransaction': {
                const transactionData = request.params[0];

                const chainEntry = findEthereumTokenByChainId(eip155StringToChainId(chainId));

                if (!chainEntry) throw new Error('Chain not found');
                const ethereumPrivateKey = (await getKeyFromChain(chainEntry)) as EthereumPrivateKey;

                let transaction: ITransaction;

                if (ethereumPrivateKey) {
                    transaction = await EthereumTransaction.fromTransaction(
                        ethereumPrivateKey,
                        transactionData,
                        chainEntry.chain as EthereumChain
                    );
                    const account = await getAccountFromChain(chainEntry);
                    const transactionRequest = new WalletTransactionRequest(
                        transaction,
                        ethereumPrivateKey,
                        account,
                        this,
                        event
                    );

                    transactionRequest.setOrigin(verifyContext?.verified?.origin);

                    this.navigateToTransactionScreen(transactionRequest);
                } else {
                    transaction = new EthereumTransaction(transactionData, chainEntry.chain as EthereumChain);
                    // navigation.navigate('CreateEthereumKey', {
                    //     requestType: 'transactionRequest',
                    //     payload: event,
                    //     transaction: transaction,
                    //     session,
                    // });
                }

                break;
            }

            default: {
                const response = {
                    id: id,
                    error: getSdkError('UNSUPPORTED_METHODS'),
                    jsonrpc: '2.0',
                };

                await this.web3wallet?.respondSessionRequest({
                    topic,
                    response,
                });
                return;
            }
        }
    }

    protected async navigateToLoginScreen(request: ILoginRequest): Promise<void> {
        navigate('WalletConnectLogin', { loginRequest: request });
    }

    protected async navigateToTransactionScreen(request: ITransactionRequest): Promise<void> {
        navigate('SignTransaction', {
            request,
        });
    }

    protected async navigateToGenerateKey(request: unknown): Promise<void> {
        debug(`Navigating to transaction screen with amount: ${request}`);
        // Logic to navigate to the Ethereum transaction screen
    }
}

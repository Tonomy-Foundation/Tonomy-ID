import { Core } from '@walletconnect/core';
import Web3Wallet from '@walletconnect/web3wallet';
import NetInfo from '@react-native-community/netinfo';
import { ICore, SessionTypes, SignClientTypes } from '@walletconnect/types';
import DebugAndLog from '../debug';
import { NETWORK_ERROR_MESSAGE } from '../../utils/errors';
import settings from '../../settings';
import {
    AbstractSession,
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
    LoginApp,
} from '../chain/types';
import { getSdkError } from '@walletconnect/utils';
import { keyStorage } from '../StorageManager/setup';
import { EthereumAccount, EthereumChain, EthereumPrivateKey, EthereumTransaction } from '../chain/etherum';
import { navigate } from '../navigate';
import {
    getAccountFromChain,
    getKeyFromChain,
    getKeyOrNullFromChain,
    tokenRegistry,
    TokenRegistryEntry,
} from '../tokenRegistry';
import { redirectToMobileBrowser } from '../navigate';
import useErrorStore from '../../store/errorStore';

const debug = DebugAndLog('tonomy-id:utils:session:walletConnect');

export const findEthereumTokenByChainId = (chainId: string) => {
    return tokenRegistry.find(
        ({ chain }) => chain.getChainType() === ChainType.ETHEREUM && chain.getChainId() === chainId
    );
};

export const eip155StringToChainId = (eip155String: string) => {
    return eip155String.split(':')[1];
};

interface NavigateGenerateKeyParams {
    requestType: string;
    request: SignClientTypes.EventArguments['session_request'] | SignClientTypes.EventArguments['session_proposal'];
    session: WalletConnectSession;
    transaction?: ITransaction;
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
        session: ISession
    ) {
        this.loginApp = loginApp;
        this.account = accounts;
        this.request = request;
        this.session = session;
    }

    static async fromRequest(
        accounts: IAccount[],
        session: WalletConnectSession,
        request: SignClientTypes.EventArguments['session_proposal']
    ): Promise<WalletLoginRequest> {
        const { name, url, icons } = request?.params?.proposer?.metadata ?? {};

        const chains = accounts.map((account) => account.getChain());

        const loginApp = new LoginApp(name, url, icons?.[0], chains);

        return new WalletLoginRequest(loginApp, accounts, request, session);
    }

    setNamespaces(namespaces: SessionTypes.Namespaces): void {
        this.namespaces = namespaces;
    }

    getNamespaces(): SessionTypes.Namespaces {
        return this.namespaces;
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
        const origin = this.loginApp.getOrigin();

        if (origin) await redirectToMobileBrowser(origin);
        await this.session.web3wallet?.rejectSession({
            id: this.request.id,
            reason: getSdkError('USER_REJECTED'),
        });
    }

    async approve(): Promise<void> {
        const origin = this.loginApp.getOrigin();

        if (origin) await redirectToMobileBrowser(origin);

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
    origin?: string;

    constructor(transaction: ITransaction, privateKey: IPrivateKey, account: IAccount) {
        this.transaction = transaction;
        this.privateKey = privateKey;
        this.account = account;
    }

    private setSession(session: ISession) {
        this.session = session;
    }

    private setRequest(request: SignClientTypes.EventArguments['session_request']) {
        this.request = request;
    }

    static async fromRequest(
        chainEntry: TokenRegistryEntry,
        ethereumPrivateKey: EthereumPrivateKey,
        request: SignClientTypes.EventArguments['session_request'],
        session: WalletConnectSession
    ): Promise<WalletTransactionRequest> {
        const { params } = request;
        const { request: requestParams } = params;

        const transactionData = requestParams.params[0];
        const account = await getAccountFromChain(chainEntry);

        const transaction = await EthereumTransaction.fromTransaction(
            ethereumPrivateKey,
            transactionData,
            chainEntry.chain as EthereumChain
        );
        const walletTransactionRequest = new WalletTransactionRequest(transaction, ethereumPrivateKey, account);

        walletTransactionRequest.setSession(session);
        walletTransactionRequest.setRequest(request);
        return walletTransactionRequest;
    }

    static async fromTransaction(
        transactionData: {
            from: string;
            to: string;
            value: bigint;
        },
        privateKey: IPrivateKey,
        chain: IChain
    ): Promise<WalletTransactionRequest> {
        const transaction = await EthereumTransaction.fromTransaction(
            privateKey as EthereumPrivateKey,
            transactionData,
            chain as EthereumChain
        );
        const token = await findEthereumTokenByChainId(chain.getChainId());
        const account = await getAccountFromChain(token as TokenRegistryEntry);

        return new WalletTransactionRequest(transaction, privateKey, account);
    }

    getOrigin(): string | null {
        if (this.request) {
            const { verifyContext } = this.request;

            this.origin = verifyContext?.verified?.origin;
        }

        return this.origin ?? null;
    }

    async reject(): Promise<void> {
        if (this.request && this.session) {
            const response = {
                id: this.request.id,
                error: getSdkError('USER_REJECTED'),
                jsonrpc: '2.0',
            };

            if (this.origin) await redirectToMobileBrowser(this.origin);

            await this.session.web3wallet?.respondSessionRequest({
                topic: this.request.topic,
                response,
            });
        }
    }

    async approve(): Promise<ITransactionReceipt> {
        let receipt: ITransactionReceipt;

        if (this.request && this.session) {
            receipt = await this.privateKey.sendTransaction(this.transaction);

            const signedTransaction = receipt.getRawReceipt();
            const response = { id: this.request.id, result: signedTransaction, jsonrpc: '2.0' };

            if (this.origin) await redirectToMobileBrowser(this.origin);

            await this.session.web3wallet?.respondSessionRequest({ topic: this.request.topic, response });
        } else {
            receipt = await this.privateKey.sendTransaction(this.transaction);
        }

        return receipt;
    }
}

export class WalletConnectSession extends AbstractSession {
    core: ICore;
    initialized: boolean;
    web3wallet: Web3Wallet;
    async initialize(): Promise<void> {
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
                if (e.msg && e.msg.includes('No internet connection')) throw new Error(NETWORK_ERROR_MESSAGE);
                else throw e;
            }
        }
    }

    async onQrScan(data: string): Promise<void> {
        await this.web3wallet.core.pairing.pair({ uri: data });
    }

    async onLink(data: string): Promise<void> {
        await this.web3wallet.core.pairing.pair({ uri: data });
    }

    async onEvent(): Promise<void> {
        this.web3wallet?.on('session_proposal', async (proposal) => {
            try {
                await this.handleLoginRequest(proposal);
            } catch (e) {
                debug('onEvent() session_proposal error:', e);
                useErrorStore.getState().setError({ error: e, title: '', expected: false });
            }
        });
        this.web3wallet?.on('session_request', async (proposal) => {
            try {
                await this.handleTransactionRequest(proposal);
            } catch (e) {
                debug('onEvent() session_request error:', e);
                useErrorStore.getState().setError({ error: e, expected: false });
            }
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

    async handleLoginRequest(request: SignClientTypes.EventArguments['session_proposal']): Promise<void> {
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
                        this.navigateToGenerateKey({
                            requestType: 'loginRequest',
                            request: request,
                            session: this,
                        });
                        return;
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

            const loginRequest = await WalletLoginRequest.fromRequest(accounts, this, request);

            loginRequest.setNamespaces(namespaces);
            this.navigateToLoginScreen(loginRequest);
        }
    }

    async handleTransactionRequest(event: SignClientTypes.EventArguments['session_request']): Promise<void> {
        const { topic, params, id } = event;
        const { request, chainId } = params;

        switch (request.method) {
            case 'eth_sendTransaction': {
                const transactionData = request.params[0];

                const chainEntry = findEthereumTokenByChainId(eip155StringToChainId(chainId));

                if (!chainEntry) throw new Error('Chain not found');
                const ethereumPrivateKey = (await getKeyFromChain(chainEntry)) as EthereumPrivateKey;

                if (ethereumPrivateKey) {
                    const transactionRequest = await WalletTransactionRequest.fromRequest(
                        chainEntry,
                        ethereumPrivateKey,
                        event,
                        this
                    );

                    this.navigateToTransactionScreen(transactionRequest);
                } else {
                    const transaction = new EthereumTransaction(transactionData, chainEntry.chain as EthereumChain);

                    this.navigateToGenerateKey({
                        requestType: 'transactionRequest',
                        request: event,
                        session: this,
                        transaction: transaction,
                    });
                    return;
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

    protected async navigateToGenerateKey(request: NavigateGenerateKeyParams): Promise<void> {
        navigate('CreateEthereumKey', request);
    }
}

import { Core } from '@walletconnect/core';
import Web3Wallet from '@walletconnect/web3wallet';
import NetInfo from '@react-native-community/netinfo';
import { ICore, SessionTypes, SignClientTypes } from '@walletconnect/types';
import Debug from 'debug';
import { NETWORK_ERROR_MESSAGE } from '../../utils/errors';
import settings from '../../settings';
import { AbstractSession, ILoginRequest, ITransactionRequest } from '../chain/types';
import { getChainIds, hasUnsupportedChains } from './helper';
import { getSdkError } from '@walletconnect/utils';
import { supportedChains } from '../assetDetails';
import { keyStorage } from '../StorageManager/setup';

const debug = Debug('tonomy-id:utils:session:walletConnect');

export class WalletConnectSession extends AbstractSession {
    core: ICore;
    web3wallet: Web3Wallet;
    initialized: boolean;

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
                // Register event listeners after web3wallet is initialized
                // Ensure 'this' context is correct
                // this.web3wallet.on('session_proposal', (eventData) => this.onEvent(eventData));
                // this.web3wallet.on('session_request', (eventData) => this.onEvent(eventData));

                this.initialized = true;
                console.log('Listeners for session_proposal and session_request are set');

                this.onEvent();
            } catch (e) {
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
        console.log(`Event received with type: `);
        this.web3wallet.on('session_proposal', async (proposal) => {
            console.log('proposal', proposal);
            await this.handleLoginRequest(proposal);
        });
    }

    protected async handleLoginRequest(request: SignClientTypes.EventArguments['session_proposal']): Promise<void> {
        debug(`Handling login request:`, request);
        const {
            id,
            params: { requiredNamespaces, optionalNamespaces },
        } = request;
        const activeNamespaces = Object.keys(requiredNamespaces).length ? requiredNamespaces : optionalNamespaces;
        const chainIds = getChainIds(activeNamespaces);

        console.log('chainIds', chainIds);

        if (hasUnsupportedChains(chainIds)) {
            await this.web3wallet.rejectSession({
                id: id,
                reason: getSdkError('UNSUPPORTED_CHAINS'),
            });
            throw new Error('We currently support Ethereum Mainnet, Sepolia Testnet, and Polygon Mainnet.');
        } else {
            const namespaces: SessionTypes.Namespaces = {};
            const chainAccounts = await getChainAccounts(chainIds);

            // Populate namespaces
            Object.keys(activeNamespaces).forEach((key) => {
                const accounts: string[] = [];

                activeNamespaces[key].chains?.forEach((chain) => {
                    const chainId = chain.split(':')[1];
                    const chainDetail = chainAccounts.find((account) => account.getChain().getChainId() === chainId);

                    if (!chainDetail) throw new Error(`Account not found for chainId ${chainId}`);
                    accounts.push(`${chain}:${chainDetail.getName()}`);
                });
                namespaces[key] = {
                    chains: activeNamespaces[key].chains,
                    accounts,
                    methods: activeNamespaces[key].methods,
                    events: activeNamespaces[key].events,
                };
            });

            for (const chainId of chainIds) {
                const supportedChain = supportedChains.find(({ chain }) => chain.getChainId() === chainId);

                if (supportedChain) {
                    const key = await keyStorage.findByName(supportedChain.keyName, supportedChain.chain);

                    if (!key) {
                        this.navigateToGenerateKey({});
                    } else {
                        this.navigateToLoginScreen({});
                    }
                }
            }
        }
    }

    protected async handleTransactionRequest(
        request: SignClientTypes.EventArguments['session_request']
    ): Promise<void> {
        debug(`Handling transaction request:`, request);
        // Handle Ethereum-specific transaction request
    }

    protected async navigateToLoginScreen(request: ILoginRequest): Promise<void> {
        debug(`Navigating to login screen for user: ${request}`);
        // Logic to navigate to the Ethereum login screen
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

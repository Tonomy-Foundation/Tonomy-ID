import { Core } from '@walletconnect/core';
import Web3Wallet from '@walletconnect/web3wallet';
import NetInfo from '@react-native-community/netinfo';
import { ICore } from '@walletconnect/types';
import Debug from 'debug';
import { NETWORK_ERROR_MESSAGE } from '../../utils/errors';
import settings from '../../settings';
import { AbstractSession, ILoginRequest, ITransactionRequest } from '../chain/types';

const debug = Debug('tonomy-id:utils:session:walletConnect');

export class WalletConnectSession extends AbstractSession {
    protected core: ICore;
    protected web3wallet: Web3Wallet;
    protected initialized: boolean;

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
                console.error('useWalletStore() error on Web3Wallet.init()', JSON.stringify(e, null, 2));
                if (e.msg && e.msg.includes('No internet connection')) throw new Error(NETWORK_ERROR_MESSAGE);
                else throw e;
            }
        }
    }

    async onQrScan(data: string): Promise<void> {
        debug(`QR code scanned with data: ${data}`);
        // Handle QR code scan specific to Ethereum here
    }

    async onLink(data: string): Promise<void> {
        debug(`Link received with data: ${data}`);
        // Handle link data specific to Ethereum here
    }

    async onEvent(request: unknown): Promise<void> {
        debug(`Event received with request:`, request);
        // Handle generic event data for Ethereum
    }

    protected async handleLoginRequest(request: unknown): Promise<void> {
        debug(`Handling login request:`, request);
        // Handle Ethereum-specific login request
    }

    protected async handleTransactionRequest(request: unknown): Promise<void> {
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
}

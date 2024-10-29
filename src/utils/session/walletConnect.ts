import { Core } from '@walletconnect/core';
import Web3Wallet from '@walletconnect/web3wallet';
import NetInfo from '@react-native-community/netinfo';
import Debug from 'debug';
import { NETWORK_ERROR_MESSAGE } from '../../utils/errors';
import useSessionStore from '../../store/sessionStore';
import settings from '../../settings';

const debug = Debug('tonomy-id:utils:initializeSession');

export async function WaalletConnectSession() {
    const { protocols } = useSessionStore();
    const { initialized, web3wallet, setWalletConnectState } = protocols.WalletConnect;

    if (initialized) {
        debug('initializeWalletState() Already initialized');
        return;
    }

    const netInfoState = await NetInfo.fetch();

    if (!netInfoState.isConnected) {
        throw new Error(NETWORK_ERROR_MESSAGE);
    }

    if (!initialized && !web3wallet) {
        const core = new Core({
            projectId: settings.config.walletConnectProjectId,
            relayUrl: 'wss://relay.walletconnect.com',
        });

        try {
            const web3walletInstance = await Web3Wallet.init({
                core,
                metadata: {
                    name: settings.config.appName,
                    description: settings.config.ecosystemName,
                    url: 'https://walletconnect.com/',
                    icons: [settings.config.images.logo48],
                },
            });

            setWalletConnectState({
                web3wallet: web3walletInstance,
                core: core,
                initialized: true,
            });
        } catch (e) {
            console.error('useWalletStore() error on Web3Wallet.init()', JSON.stringify(e, null, 2));
            if (e.msg && e.msg.includes('No internet connection')) throw new Error(NETWORK_ERROR_MESSAGE);
            else throw e;
        }
    }
}

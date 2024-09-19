import { NavigationProp, useNavigation } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import {
    AuthenticationMessage,
    CommunicationError,
    LinkAuthRequestMessage,
    LoginRequestsMessage,
    objToBase64Url,
    parseDid,
    SdkError,
    SdkErrors,
} from '@tonomy/tonomy-id-sdk';
import { useCallback, useEffect, useState } from 'react';
import useErrorStore from '../store/errorStore';
import { RouteStackParamList } from '../navigation/Root';
import { scheduleNotificationAsync } from 'expo-notifications';
import { AppState } from 'react-native';
import { keyStorage } from '../utils/StorageManager/setup';
import {
    EthereumMainnetChain,
    EthereumPolygonChain,
    EthereumPrivateKey,
    EthereumSepoliaChain,
    EthereumTransaction,
} from '../utils/chain/etherum';
import { ITransaction } from '../utils/chain/types';
import useWalletStore from '../store/useWalletStore';
import { getSdkError } from '@walletconnect/utils';
import Debug from 'debug';
import { isNetworkError } from '../utils/errors';
import { debounce, progressiveRetryOnNetworkError } from '../utils/network';

const debug = Debug('tonomy-id:services:CommunicationModule');

export default function CommunicationModule() {
    const { user, logout } = useUserStore();
    const navigation = useNavigation<NavigationProp<RouteStackParamList>>();
    const errorStore = useErrorStore();
    const [subscribers, setSubscribers] = useState<number[]>([]);
    const { initialized, web3wallet, disconnectSession } = useWalletStore();

    /**
     *  Login to communication microservice
     *  should be called on app start
     */
    async function loginToService() {
        try {
            const issuer = await user.getIssuer();
            const message = await AuthenticationMessage.signMessageWithoutRecipient({}, issuer);

            debug('loginToService() login message', message);

            const subscribers = listenToMessages();

            debug('loginToService() subscribers', subscribers);

            setSubscribers(subscribers);

            try {
                await user.loginCommunication(message);
            } catch (e) {
                if (e instanceof CommunicationError && (e.exception.status === 401 || e.exception.status === 404)) {
                    await logout(
                        e.exception.status === 401 ? 'Communication key rotation' : 'Communication key not found'
                    );
                } else {
                    throw e;
                }
            }
        } catch (e) {
            unsubscribeAll();

            if (isNetworkError(e)) {
                debug('loginToService() Network error');
            } else if (e instanceof SdkError && e.code === SdkErrors.CommunicationNotConnected) {
                debug('loginToService() Network error connecting to Communication service');
            } else {
                errorStore.setError({ error: e, expected: false });
            }
        }
    }

    function listenToMessages(): number[] {
        const loginRequestSubscriber = user.subscribeMessage(async (message) => {
            try {
                const senderDid = message.getSender();

                const { method, id } = parseDid(senderDid);

                // did:key is used for the initial login request so is allowed
                if (method !== 'key' && id !== parseDid(await user.getDid()).id) {
                    debug('LoginRequestsMessage sender did not match user did', senderDid, await user.getDid());
                    // Drop message. It came from a different account and we are not interested in it here.
                    // TODO: low priority: handle this case in a better way as it does present a DOS vector.
                    return;
                }

                await message.verify();

                const loginRequestsMessage = new LoginRequestsMessage(message);
                const payload = loginRequestsMessage.getPayload();
                const base64UrlPayload = objToBase64Url(payload);

                navigation.navigate('SSO', {
                    payload: base64UrlPayload,
                    platform: 'browser',
                });
                sendLoginNotificationOnBackground(payload.requests[0].getPayload().origin);
            } catch (e) {
                errorStore.setError({ error: e, expected: false });
            }
        }, LoginRequestsMessage.getType());

        const linkAuthRequestSubscriber = user.subscribeMessage(async (message) => {
            try {
                const senderDid = message.getSender().split('#')[0];

                if (senderDid !== (await user.getDid())) {
                    debug(
                        'linkAuthRequestSubscriber() LinkAuthRequestMessage sender did not match user did',
                        senderDid,
                        await user.getDid()
                    );
                    // Drop message. It came from a different account and we are not interested in it here.
                    // TODO: low priority: handle this case in a better way as it does present a DOS vector.
                    return;
                }

                await user.handleLinkAuthRequestMessage(message);
            } catch (e) {
                if (isNetworkError(e)) {
                    debug('linkAuthRequestSubscriber() Network error');
                } else if (e instanceof SdkError && e.code === SdkErrors.CommunicationNotConnected) {
                    debug('linkAuthRequestSubscriber() Network error connecting to Communication service');
                } else {
                    errorStore.setError({ error: e, expected: false });
                }
            }
        }, LinkAuthRequestMessage.getType());

        return [loginRequestSubscriber, linkAuthRequestSubscriber];
    }

    function sendLoginNotificationOnBackground(appName: string) {
        if (AppState.currentState === 'background') {
            scheduleNotificationAsync({
                content: {
                    title: `Login Request: ${appName}`,
                    body: `${appName} requesting your permission to login`,
                },
                trigger: null,
            });
        }
    }

    useEffect(() => {
        progressiveRetryOnNetworkError(() => loginToService());

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation, user]);

    const unsubscribeAll = useCallback(() => {
        for (const s of subscribers) {
            user.unsubscribeMessage(s);
        }
    }, [subscribers, user]);

    useEffect(() => {
        return () => {
            unsubscribeAll();
        };
    }, [subscribers, user, unsubscribeAll]);

    function sendWalletConnectNotificationOnBackground(title: string, body: string) {
        if (AppState.currentState === 'background') {
            scheduleNotificationAsync({
                content: {
                    title,
                    body,
                },
                trigger: null,
            });
        }
    }

    useEffect(() => {
        try {
            const onSessionProposal = debounce(async (proposal) => {
                try {
                    const { id } = proposal;
                    const { requiredNamespaces, optionalNamespaces } = proposal.params;
                    const activeNamespaces = Object.keys(requiredNamespaces).length
                        ? requiredNamespaces
                        : optionalNamespaces;
                    const chainIds = activeNamespaces.eip155.chains?.map((chain) => chain.split(':')[1]);
                    const unsupportedChainIds =
                        chainIds?.filter((chainId) => !['1', '11155111', '137'].includes(chainId)) || [];

                    if (unsupportedChainIds?.length > 0) {
                        errorStore.setError({
                            title: 'Unsupported Chains',
                            error: new Error(
                                'We currently support Ethereum Mainnet, Sepolia Testnet, and Polygon Mainnet.'
                            ),
                            expected: true,
                        });
                        await web3wallet?.rejectSession({
                            id: id,
                            reason: getSdkError('UNSUPPORTED_CHAINS'),
                        });
                        return;
                    } else {
                        const supportedChains = {
                            '1': { name: 'ethereum', chainObject: EthereumMainnetChain },
                            '11155111': { name: 'ethereumTestnetSepolia', chainObject: EthereumSepoliaChain },
                            '137': { name: 'ethereumPolygon', chainObject: EthereumPolygonChain },
                        };

                        let keyFound = false;

                        for (const chainId of chainIds) {
                            if (supportedChains[chainId]) {
                                const { name, chainObject } = supportedChains[chainId];
                                const key = await keyStorage.findByName(name, chainObject);

                                if (!key) {
                                    navigation.navigate('CreateEthereumKey', {
                                        requestType: 'loginRequest',
                                        payload: proposal,
                                    });
                                    return;
                                } else {
                                    keyFound = true;
                                }
                            }
                        }

                        if (keyFound) {
                            navigation.navigate('WalletConnectLogin', {
                                payload: proposal,
                                platform: 'browser',
                            });
                        }
                    }
                } catch (error) {
                    if (isNetworkError(error)) {
                        debug('onSessionProposal() network error');
                    } else {
                        console.error('CommunicationModule() onSessionProposal() unexpected error', error);
                    }
                }
            }, 1000);

            const onSessionRequest = debounce(async (event) => {
                try {
                    const { topic, params, id, verifyContext } = event;
                    const { request, chainId } = params;

                    switch (request.method) {
                        case 'eth_sendTransaction': {
                            const transactionData = request.params[0];

                            let key, chain;

                            if (chainId === 'eip155:11155111') {
                                chain = EthereumSepoliaChain;
                                key = await keyStorage.findByName('ethereumTestnetSepolia', chain);
                            } else if (chainId === 'eip155:1') {
                                chain = EthereumMainnetChain;
                                key = await keyStorage.findByName('ethereum', chain);
                            } else if (chainId === 'eip155:137') {
                                chain = EthereumPolygonChain;
                                key = await keyStorage.findByName('ethereumPolygon', chain);
                            } else throw new Error('Unsupported chains');

                            let transaction: ITransaction;

                            if (key) {
                                const exportPrivateKey = await key.exportPrivateKey();
                                const ethereumPrivateKey = new EthereumPrivateKey(exportPrivateKey, chain);

                                transaction = await EthereumTransaction.fromTransaction(
                                    ethereumPrivateKey,
                                    transactionData,
                                    chain
                                );
                                navigation.navigate('SignTransaction', {
                                    transaction,
                                    privateKey: key,
                                    session: {
                                        origin: verifyContext?.verified?.origin,
                                        id,
                                        topic,
                                    },
                                });
                            } else {
                                transaction = new EthereumTransaction(transactionData, chain);
                                navigation.navigate('CreateEthereumKey', {
                                    requestType: 'transactionRequest',
                                    transaction: {
                                        transaction,
                                        session: {
                                            origin: verifyContext?.verified?.origin,
                                            id,
                                            topic,
                                        },
                                    },
                                });
                            }

                            sendWalletConnectNotificationOnBackground(
                                'Transaction Request',
                                'Ethereum transaction signing request'
                            );
                            break;
                        }

                        default: {
                            const response = {
                                id: id,
                                error: getSdkError('UNSUPPORTED_METHODS'),
                                jsonrpc: '2.0',
                            };

                            await web3wallet?.respondSessionRequest({
                                topic,
                                response,
                            });
                            return;
                        }
                    }
                } catch (error) {
                    if (isNetworkError(error)) {
                        debug('onSessionRequest() network error');
                    } else {
                        console.error('CommunicationModule() onSessionRequest() unexpected error', error);
                    }
                }
            }, 1000);

            web3wallet?.on('session_proposal', onSessionProposal);
            web3wallet?.on('session_request', onSessionRequest);

            return () => {
                web3wallet?.off('session_proposal', onSessionProposal);
                web3wallet?.off('session_request', onSessionRequest);
            };
        } catch (e) {
            console.error('CommunicationModule() Error when setting up WalletConnect listeners', e);
            errorStore.setError({ error: e, expected: false, title: 'Error setting up WalletConnect listeners' });
        }
    }, [errorStore, web3wallet, initialized, navigation]);

    useEffect(() => {
        try {
            const handleSessionDelete = debounce(async (event) => {
                try {
                    if (event.topic) {
                        const sessions = await web3wallet?.getActiveSessions();
                        const sessionExists =
                            Array.isArray(sessions) && sessions.some((session) => session.topic === event.topic);

                        if (sessionExists) {
                            await web3wallet?.disconnectSession({
                                topic: event.topic,
                                reason: getSdkError('INVALID_SESSION_SETTLE_REQUEST'),
                            });
                            disconnectSession();
                        } else {
                            debug('Session already deleted or invalid');
                        }
                    }
                } catch (error) {
                    console.error('CommunicationModule() handleSessionDelete() unexpected error', error);
                }
            }, 1000);

            web3wallet?.on('session_delete', handleSessionDelete);

            return () => {
                web3wallet?.off('session_delete', handleSessionDelete);
            };
        } catch (e) {
            console.error('CommunicationModule() Error when setting up session delete listener for WalletConnect', e);
            errorStore.setError({ error: e, expected: false, title: 'Error setting up WalletConnect listeners' });
        }
    }, [web3wallet, disconnectSession, navigation, errorStore]);

    return null;
}

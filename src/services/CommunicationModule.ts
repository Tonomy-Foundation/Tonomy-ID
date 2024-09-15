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
            // const subscribers = listenToMessages();

            // setSubscribers(subscribers);

            try {
                await user.loginCommunication(message);
            } catch (e) {
                debug(
                    'loginToService loginCommunication error',
                    e.code,
                    e.code === SdkErrors.CommunicationNotConnected
                );

                if (e.message === 'Network request failed') {
                    debug('Network error in communication login');
                } else if (e instanceof SdkError && e.code === SdkErrors.CommunicationNotConnected) {
                    debug('communication not connected');
                    errorStore.setError({
                        error: new Error(' Could not connect to Tonomy Communication server'),
                        expected: false,
                    });
                }
                // 401 signature invalid: the keys have been rotated and the old key is no longer valid
                // 404 did not found: must have changed network (blockchain full reset - should only happen on local dev)
                else if (
                    e instanceof CommunicationError &&
                    (e.exception.status === 401 || e.exception.status === 404)
                ) {
                    await logout(
                        e.exception.status === 401 ? 'Communication key rotation' : 'Communication key not found'
                    );
                } else {
                    debug('loginToService loginCommunication error else ');
                    // errorStore.setError({ error: e, expected: false });
                }
            }
        } catch (e) {
            debug('loginToService error', e);

            if (e.message === 'Network request failed') {
                debug('Network error in communication login');
            } else if (e instanceof SdkError && e.code === SdkErrors.CommunicationNotConnected) {
                errorStore.setError({
                    error: new Error(' Could not connect to Tonomy Communication server'),
                    expected: false,
                });
            } else {
                debug('loginToService error else ');
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
                if (e.message === 'Network request failed') {
                    debug('Network error in communication login');
                } else if (e instanceof SdkError && e.code === SdkErrors.CommunicationNotConnected) {
                    errorStore.setError({
                        error: new Error(' Could not connect to Tonomy Communication server'),
                        expected: false,
                    });
                } else {
                    debug('listenToMessages error else ');

                    // errorStore.setError({ error: e, expected: false });
                }
            }
        }, LoginRequestsMessage.getType());

        const linkAuthRequestSubscriber = user.subscribeMessage(async (message) => {
            try {
                const senderDid = message.getSender().split('#')[0];

                if (senderDid !== (await user.getDid())) {
                    debug('LinkAuthRequestMessage sender did not match user did', senderDid, await user.getDid());
                    // Drop message. It came from a different account and we are not interested in it here.
                    // TODO: low priority: handle this case in a better way as it does present a DOS vector.
                    return;
                }

                await user.handleLinkAuthRequestMessage(message);
            } catch (e) {
                if (e.message === 'Network request failed') {
                    debug('Network error in communication login');
                } else if (e instanceof SdkError && e.code === SdkErrors.CommunicationNotConnected) {
                    errorStore.setError({
                        error: new Error(' Could not connect to Tonomy Communication server'),
                        expected: false,
                    });
                } else {
                    debug('linkAuthRequestSubscriber error else ');

                    // errorStore.setError({ error: e, expected: false });
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
        loginToService();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation, user]);

    useEffect(() => {
        return () => {
            for (const s of subscribers) {
                user.unsubscribeMessage(s);
            }
        };
    }, [subscribers, user]);

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

    const handleConnect = useCallback(async () => {
        try {
            const onSessionProposal = async (proposal) => {
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
                    if (error.message === 'Network request failed') {
                        debug('network error when initializing wallet account');
                    }
                }
            };

            const onSessionRequest = async (event) => {
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
                    if (error.message === 'Network request failed') {
                        debug('network error when initializing wallet account');
                    }
                }
            };

            web3wallet?.off('session_proposal', onSessionProposal);
            web3wallet?.off('session_request', onSessionRequest);

            web3wallet?.on('session_proposal', onSessionProposal);
            web3wallet?.on('session_request', onSessionRequest);

            return () => {
                web3wallet?.off('session_proposal', onSessionProposal);
                web3wallet?.off('session_request', onSessionRequest);
            };
        } catch (e) {
            if (e.message === 'Network request failed') {
                debug('network error when listening wallet requests');
            } else {
                debug('handle session proposal error', e);
            }
        }
    }, [navigation, web3wallet, errorStore]);

    useEffect(() => {
        if (web3wallet) handleConnect();
    }, [handleConnect, web3wallet, initialized]);

    const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
        let timeout: ReturnType<typeof setTimeout>;

        return (...args: Parameters<T>): void => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

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
                } catch (disconnectError) {
                    console.error('Failed to disconnect session:', disconnectError);
                }
            }, 1000);

            web3wallet?.on('session_delete', handleSessionDelete);

            return () => {
                web3wallet?.off('session_delete', handleSessionDelete);
            };
        } catch (e) {
            if (e.message === 'Network request failed') {
                debug('network error when listening wallet requests');
            } else {
                debug('handle session delete error', e);
            }
        }
    }, [web3wallet, disconnectSession, navigation, errorStore]);

    return null;
}

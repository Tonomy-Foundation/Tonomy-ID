import { NavigationProp, useNavigation } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import {
    AuthenticationMessage,
    CommunicationError,
    LinkAuthRequestMessage,
    LoginRequestsMessage,
    getSettings,
    objToBase64Url,
    parseDid,
} from '@tonomy/tonomy-id-sdk';
import { useCallback, useEffect, useState } from 'react';
import useErrorStore from '../store/errorStore';
import { RouteStackParamList } from '../navigation/Root';
import { scheduleNotificationAsync } from 'expo-notifications';
import { AppState } from 'react-native';
import { SignClientTypes } from '@walletconnect/types';
import useInitialization from '../hooks/useWalletConnect';

export default function CommunicationModule() {
    const { user, logout } = useUserStore();
    const navigation = useNavigation<NavigationProp<RouteStackParamList>>();
    const errorStore = useErrorStore();
    const [subscribers, setSubscribers] = useState<number[]>([]);
    const { web3wallet } = useInitialization();

    /**
     *  Login to communication microservice
     *  should be called on app start
     */
    async function loginToService() {
        try {
            const issuer = await user.getIssuer();
            const message = await AuthenticationMessage.signMessageWithoutRecipient({}, issuer);
            const subscribers = listenToMessages();

            setSubscribers(subscribers);

            try {
                await user.loginCommunication(message);
            } catch (e) {
                // 401 signature invalid: the keys have been rotated and the old key is no longer valid
                // 404 did not found: must have changed network (blockchain full reset - should only happen on local dev)
                if (e instanceof CommunicationError && (e.exception.status === 401 || e.exception.status === 404)) {
                    await logout(
                        e.exception.status === 401 ? 'Communication key rotation' : 'Communication key not found'
                    );
                } else {
                    throw e;
                }
            }
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    function listenToMessages(): number[] {
        const loginRequestSubscriber = user.subscribeMessage(async (message) => {
            try {
                const senderDid = message.getSender();

                const { method, id } = parseDid(senderDid);

                // did:jwk is used for the initial login request so is allowed
                if (method !== 'jwk' && id !== parseDid(await user.getDid()).id) {
                    if (getSettings().loggerLevel === 'debug')
                        console.log(
                            'LoginRequesrtsMessage sender did not match user did',
                            senderDid,
                            await user.getDid()
                        );
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
                    if (getSettings().loggerLevel === 'debug')
                        console.log(
                            'LinkAuthRequestMessage sender did not match user did',
                            senderDid,
                            await user.getDid()
                        );
                    // Drop message. It came from a different account and we are not interested in it here.
                    // TODO: low priority: handle this case in a better way as it does present a DOS vector.
                    return;
                }

                await user.handleLinkAuthRequestMessage(message);
            } catch (e) {
                errorStore.setError({ error: e, expected: false });
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

    const onSessionProposal = useCallback(async (proposal: SignClientTypes.EventArguments['session_proposal']) => {
        if (proposal) {
            navigation.navigate('WalletConnectLogin', {
                payload: proposal,
                platform: 'browser',
            });
        }
    }, []);

    const onSessionRequest = useCallback(async (requestEvent: SignClientTypes.EventArguments['session_request']) => {
        const { topic, params } = requestEvent;
        const { request } = params;
        const requestSessionData = web3wallet?.engine.signClient.session.get(topic);

        switch (request.method) {
            case 'eth_sendTransaction':
                navigation.navigate('SignTransaction', {
                    requestSession: requestSessionData,
                    requestEvent: requestEvent,
                });
                sendWalletConnectNotificationOnBackground(
                    'Transaction Request',
                    'Ethereum transaction signing request'
                );
                return;
            default:
                return 'Method not supported';
        }
    }, []);

    useEffect(() => {
        if (web3wallet) {
            web3wallet.on('session_proposal', onSessionProposal);
            web3wallet.on('session_request', onSessionRequest);
        }
    }, [onSessionProposal, onSessionRequest, web3wallet]);

    return null;
}

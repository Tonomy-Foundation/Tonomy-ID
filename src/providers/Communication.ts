import { NavigationProp, useNavigation } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import {
    AuthenticationMessage,
    CommunicationError,
    LinkAuthRequestMessage,
    LoginRequestsMessage,
    parseDid,
    SdkErrors,
    isErrorCode,
} from '@tonomy/tonomy-id-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import useErrorStore from '../store/errorStore';
import { RouteStackParamList } from '../navigation/Root';
import { scheduleNotificationAsync } from 'expo-notifications';
import { AppState, Linking } from 'react-native';
import useWalletStore from '../store/useWalletStore';
import { getSdkError } from '@walletconnect/utils';
import Debug from 'debug';
import { isNetworkError, NETWORK_ERROR_MESSAGE } from '../utils/errors';
import { debounce, progressiveRetryOnNetworkError } from '../utils/network';
import { useSessionStore } from '../store/sessionStore';
import { captureError } from '../utils/sentry';
import settings from '../settings';

const debug = Debug('tonomy-id:services:CommunicationModule');

export default function CommunicationProvider() {
    const { user, logout, isAppInitialized, initializeStatusFromStorage } = useUserStore();
    const navigation = useNavigation<NavigationProp<RouteStackParamList>>();
    const errorStore = useErrorStore();
    const [subscribers, setSubscribers] = useState<number[]>([]);

    const { initializeSession, walletConnectSession, antelopeSession } = useSessionStore();
    const { web3wallet, disconnectSession } = useWalletStore();
    const sessionRef = useRef({ walletConnectSession, antelopeSession });

    useEffect(() => {
        sessionRef.current = { walletConnectSession, antelopeSession };
    }, [walletConnectSession, antelopeSession]);

    useEffect(() => {
        progressiveRetryOnNetworkError(loginToService);

        if (walletConnectSession && walletConnectSession.initialized) {
            debug('initializeWalletState() Already initialized');
            return;
        }

        progressiveRetryOnNetworkError(initializeSession);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation, user]);

    useEffect(() => {
        // Function to handle incoming URLs
        const handleDeepLink = async ({ url }) => {
            debug('handleDeepLink() URL:', url);

            const { protocol, origin, pathname, search } = new URL(url);

            switch (protocol) {
                case 'esr:':
                    await sessionRef.current?.antelopeSession?.onLink(url);
                    break;
                case 'wc:':
                    await sessionRef.current?.walletConnectSession?.onLink(url);
                    break;
                case 'https:':
                    if (origin !== settings.config.ssoWebsiteOrigin) {
                        throw new Error('Origin not allowed');
                    }

                    switch (pathname) {
                        case '/login': {
                            const params = new URLSearchParams(search);
                            const payload = params.get('payload');

                            if (payload) {
                                if (!isAppInitialized) {
                                    await user.initializeFromStorage();
                                }

                                navigation.navigate('SSO', {
                                    payload,
                                    receivedVia: 'deepLink',
                                });
                            } else {
                                throw new Error('Payload not found in deep link');
                            }

                            break;
                        }

                        default:
                            throw new Error('Deep link path not supported');
                    }

                    break;
                default:
                    throw new Error('Deep link protocol not supported');
            }
        };

        // Listen for deep links when the app is running
        const listener = Linking.addEventListener('url', handleDeepLink);

        // Check if the app was opened from a deep link
        (async () => {
            try {
                const url = await Linking.getInitialURL();

                if (url) {
                    await handleDeepLink({ url });
                }
            } catch (error) {
                captureError('CommunicationModule() getInitialURL error', error, 'warning');
            }
        })();

        // Cleanup the event listener when the component unmounts
        return () => {
            if (listener) listener.remove();
        };
    }, [navigation, sessionRef, walletConnectSession, antelopeSession]);

    /**
     *  Login to communication microservice
     *  should be called on app start
     */
    async function loginToService() {
        try {
            if (user) {
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
            }
        } catch (e) {
            unsubscribeAll();

            if (isNetworkError(e)) {
                throw e;
            } else if (isErrorCode(e, SdkErrors.CommunicationNotConnected)) {
                throw new Error(NETWORK_ERROR_MESSAGE);
            } else {
                errorStore.setError({ error: e, expected: false });
            }
        }
    }

    function listenToMessages(): number[] {
        /**
         * @description
         * This callback is called when a message of type `LoginRequestsMessage` is received.
         * It verifies the message and navigates to the SSO screen with the received message payload.
         * If the message sender does not match the user's DID, it is dropped.
         * @param {VerifiableCredentialWithType} message The received message
         * @returns {Promise<void>}
         */
        const loginRequestSubscriber = user.subscribeMessage(async (message) => {
            try {
                const senderDid = message.getSender();
                const { method, id } = parseDid(senderDid);

                // did:key is used for the initial login request so is allowed
                if (method !== 'key' && id !== parseDid(await user.getDid()).id) {
                    debug(`LoginRequestsMessage() sender ${senderDid} did not match ${await user.getDid()}`);
                    captureError(
                        'LoginRequestsMessage() user DOS',
                        new Error(`Sender ${senderDid} did not match ${await user.getDid()}`),
                        'info'
                    );
                    // Drop message. It came from a different account and we are not interested in it here.
                    return;
                }

                await message.verify();

                const loginRequestsMessage = new LoginRequestsMessage(message);
                const payload = loginRequestsMessage.getPayload();

                navigation.navigate('SSO', {
                    payload: payload.toString(),
                    receivedVia: 'message',
                });
                sendLoginNotificationOnBackground(payload.external.getOrigin());
            } catch (e) {
                errorStore.setError({ error: e, expected: false });
            }
        }, LoginRequestsMessage.getType());

        const linkAuthRequestSubscriber = user.subscribeMessage(async (message) => {
            try {
                const senderDid = message.getSender().split('#')[0];

                if (senderDid !== (await user.getDid())) {
                    debug(`linkAuthRequestSubscriber() sender ${senderDid} did not match ${await user.getDid()}`);
                    captureError(
                        'linkAuthRequestSubscriber() user DOS',
                        new Error(`Sender ${senderDid} did not match ${await user.getDid()}`),
                        'info'
                    );
                    // Drop message. It came from a different account and we are not interested in it here.
                    return;
                }

                await user.handleLinkAuthRequestMessage(message);
            } catch (e) {
                if (isNetworkError(e)) {
                    debug('linkAuthRequestSubscriber() Network error');
                } else if (isErrorCode(e, SdkErrors.CommunicationNotConnected)) {
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

    const unsubscribeAll = useCallback(() => {
        for (const s of subscribers) {
            user?.unsubscribeMessage(s);
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
                debug('Failed to disconnect session:', disconnectError);
            }
        }, 1000);

        web3wallet?.on('session_delete', handleSessionDelete);

        return () => {
            web3wallet?.off('session_delete', handleSessionDelete);
        };
    }, [web3wallet, disconnectSession, navigation, errorStore]);

    return null;
}

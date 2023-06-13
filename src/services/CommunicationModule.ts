import { NavigationProp, useNavigation } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import { AuthenticationMessage, CommunicationError, LoginRequestsMessage, objToBase64Url } from '@tonomy/tonomy-id-sdk';
import { useEffect, useState } from 'react';
import useErrorStore from '../store/errorStore';
import { RouteStackParamList } from '../navigation/Root';
import useRequestsStore from '../store/requestsStore';
import { scheduleNotificationAsync } from 'expo-notifications';
import { AppState } from 'react-native';

export default function CommunicationModule() {
    const { user, logout } = useUserStore();
    const navigation = useNavigation<NavigationProp<RouteStackParamList>>();
    const errorStore = useErrorStore();
    const [identifier, setIdentifier] = useState(-1);
    const requestsStore = useRequestsStore();

    /**
     *  Login to communication microservice
     *  should be called on app start
     */
    async function loginToService() {
        const issuer = await user.getIssuer();
        const message = await AuthenticationMessage.signMessageWithoutRecipient({}, issuer);
        const id = listenToMessages();

        setIdentifier(id);

        try {
            await user.communication.login(message);
        } catch (e) {
            if (e instanceof CommunicationError && e.exception.status === 401) {
                await logout();
            } else {
                throw e;
            }
        }
    }

    function listenToMessages(): number {
        try {
            return user.communication.subscribeMessage(async (message) => {
                const loginRequestsMessage = new LoginRequestsMessage(message);

                const payload = loginRequestsMessage.getPayload();

                console.log('listenToMessages()');
                const checkedRequests = await user.apps.checkRequests(payload.requests);

                console.log('listenToMessages()2');
                const isLoginRequired = checkedRequests.reduce(
                    (accumulator, request) => accumulator && request.requiresLogin,
                    true
                );

                console.log(
                    'isLoginRequired',
                    isLoginRequired,
                    checkedRequests.map((r) => r.requiresLogin)
                );

                if (isLoginRequired) {
                    requestsStore.setCheckedRequests(checkedRequests);
                    navigation.navigate('SSO', {
                        platform: 'browser',
                    });
                    sendLoginNotificationOnBackground(payload.requests[0].getPayload().origin);
                } else {
                    await user.apps.acceptLoginRequest(
                        checkedRequests.map((request) => {
                            return {
                                app: request.app,
                                request: request.request,
                                requiresLogin: request.requiresLogin,
                            };
                        }),
                        'browser',
                        message.getSender()
                    );
                }
            }, LoginRequestsMessage.getType());
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
            return -1;
        }
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
        return () => user.communication.unsubscribeMessage(identifier);
    }, [identifier, user.communication]);

    return null;
}

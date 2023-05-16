import { NavigationProp, useNavigation } from '@react-navigation/native';
import useUserStore from '../store/userStore';
import { AuthenticationMessage, CommunicationError, LoginRequestsMessage, objToBase64Url } from '@tonomy/tonomy-id-sdk';
import { useEffect, useState } from 'react';
import useErrorStore from '../store/errorStore';
import { RouteStackParamList } from '../navigation/Root';

export default function CommunicationModule() {
    const { user, logout } = useUserStore();
    const navigation = useNavigation<NavigationProp<RouteStackParamList>>();
    const errorStore = useErrorStore();
    const [identifier, setIdentifier] = useState(-1);

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
            return user.communication.subscribeMessage((message) => {
                const loginRequestsMessage = new LoginRequestsMessage(message);
                const payload = loginRequestsMessage.getPayload();
                const base64UrlPayload = objToBase64Url(payload);

                navigation.navigate('SSO', {
                    payload: base64UrlPayload,
                    platform: 'browser',
                });
            }, LoginRequestsMessage.getType());
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
            return -1;
        }
    }

    useEffect(() => {
        loginToService();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigation, user]);

    useEffect(() => {
        return () => user.communication.unsubscribeMessage(identifier);
    }, [identifier]);

    return null;
}

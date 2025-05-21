import React, { useEffect, useRef, useState } from 'react';
import * as Linking from 'expo-linking';
import { Image, StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import useUserStore from '../store/userStore';
import {
    terminateLoginRequest,
    App,
    base64UrlToObj,
    SdkErrors,
    CommunicationError,
    ResponsesManager,
    RequestsManager,
    SdkError,
    LoginRequest,
    WalletRequestAndResponseObject,
} from '@tonomy/tonomy-id-sdk';
import theme, { commonStyles } from '../utils/theme';
import useErrorStore from '../store/errorStore';
import Debug from 'debug';
import { SSOLoginScreenProps } from '../screens/SSOLoginScreen';
import { ArrowUpRight } from 'iconoir-react-native';
import SSOLoginBottomLayover from '../components/SSOLoginBottomLayover';

const debug = Debug('tonomy-id:containers:SSOLoginContainer');

export default function SSOLoginContainer({
    payload,
    platform,
    navigation,
}: {
    payload: string;
    platform: 'mobile' | 'browser';
    navigation: SSOLoginScreenProps['navigation'];
}) {
    const { user, logout } = useUserStore();
    const [responsesManager, setResponsesManager] = useState<ResponsesManager>();
    const [username, setUsername] = useState<string>();
    const [ssoApp, setSsoApp] = useState<App>();
    const [nextLoading, setNextLoading] = useState<boolean>(true);
    const [cancelLoading, setCancelLoading] = useState<boolean>(false);
    const refMessage = useRef<{ open: () => void; close: () => void }>(null);

    const errorStore = useErrorStore();

    async function setUserName() {
        try {
            const username = await user.getUsername();

            if (!username) {
                await logout('No username in SSO login screen');
            }

            setUsername(username.getBaseUsername());
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function getRequestsFromParams() {
        try {
            debug('getRequestsFromParams(): start');
            const parsedPayload = base64UrlToObj(payload);

            debug('getRequestsFromParams(): parsedPayload', parsedPayload?.requests?.length);
            const managedRequests = new RequestsManager(parsedPayload?.requests);

            debug('getRequestsFromParams(): managedRequests', managedRequests?.requests?.length);

            await managedRequests.verify();
            // TODO: check if the internal login request comes from same DID as the sender of the message.

            const managedResponses = new ResponsesManager(managedRequests);

            debug('getRequestsFromParams(): managedResponses', managedResponses);

            await managedResponses.fetchMeta({ accountName: await user.getAccountName() });

            setSsoApp(managedResponses.getExternalLoginResponseOrThrow().getAppOrThrow());
            setResponsesManager(managedResponses);
            debug('getRequestsFromParams(): end');
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        } finally {
            setNextLoading(false);
        }
    }

    async function onLogin() {
        try {
            setNextLoading(true);
            debug('onLogin() logs start:');

            if (!responsesManager) throw new Error('Responses manager is not set');

            await responsesManager.createResponses(user);

            let loginRequest: LoginRequest | WalletRequestAndResponseObject;

            try {
                loginRequest = responsesManager.getAccountsLoginRequestOrThrow();
            } catch (e) {
                if (e instanceof SdkError && e.code === SdkErrors.ResponsesNotFound) {
                    debug('onLogin() getting loginRequest from external website');
                    loginRequest = responsesManager.getExternalLoginResponseOrThrow().getRequest();
                } else throw e;
            }

            const payload = loginRequest.getPayload();

            const callbackUrl = await user.acceptLoginRequest(responsesManager, platform, {
                callbackPath: payload.callbackPath,
                callbackOrigin: payload.origin,
                messageRecipient: loginRequest.getIssuer(),
            });

            debug('onLogin() callbackUrl:', callbackUrl);

            if (platform === 'mobile') {
                if (typeof callbackUrl !== 'string') throw new Error('Callback url is not string');
                await Linking.openURL(callbackUrl);
                navigation.navigate('Assets');
            } else {
                navigation.navigate('Assets');
            }
        } catch (e) {
            if (
                e instanceof CommunicationError &&
                e.exception.status === 400 &&
                e.exception.message.startsWith('Recipient not connected')
            ) {
                debug('onLogin() CommunicationError');

                // User cancelled in the browser, so can just navigate back to home
                navigation.navigate('Assets');
            } else {
                errorStore.setError({
                    error: e,
                    expected: false,
                    onClose: async () => navigation.navigate('Assets'),
                });
            }
        } finally {
            setNextLoading(false);
        }
    }

    async function onCancel() {
        try {
            setCancelLoading(true);
            if (!responsesManager) throw new Error('Responses manager is not set');

            let loginRequest: LoginRequest | WalletRequestAndResponseObject;

            try {
                loginRequest = responsesManager.getAccountsLoginRequestOrThrow();
            } catch (e) {
                if (e instanceof SdkError && e.code === SdkErrors.ResponsesNotFound) {
                    debug('onLogin() getting loginRequest from external website');
                    loginRequest = responsesManager.getExternalLoginResponseOrThrow().getRequest();
                } else throw e;
            }

            const payload = loginRequest.getPayload();

            const res = await terminateLoginRequest(
                responsesManager,
                platform,
                {
                    code: SdkErrors.UserCancelled,
                    reason: 'User cancelled login request',
                },
                {
                    callbackPath: payload.callbackPath,
                    callbackOrigin: payload.origin,
                    messageRecipient: loginRequest.getIssuer(),
                    user,
                }
            );

            setNextLoading(false);

            if (platform === 'mobile') {
                if (typeof res !== 'string') throw new Error('Res is not string');
                await Linking.openURL(res);
            }

            navigation.navigate('Assets');
        } catch (e) {
            setCancelLoading(false);
            debug('Error in cancel', e);

            if (
                e instanceof CommunicationError &&
                e.exception.status === 400 &&
                e.exception.message.startsWith('Recipient not connected')
            ) {
                // User cancelled in the browser, so can just navigate back to home
                navigation.navigate('Assets');
            } else {
                errorStore.setError({
                    error: e,
                    expected: false,
                    onClose: async () => navigation.navigate('Assets'),
                });
            }
        }
    }

    useEffect(() => {
        setUserName();
        getRequestsFromParams();
    }, []);

    return (
        <LayoutComponent
            body={
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    {/* Progress bar */}
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressActive} />
                        <View style={styles.progressInactive} />
                        <View style={styles.progressInactive} />
                    </View>
                    {ssoApp && (
                        <View style={styles.loginCard}>
                            <Image source={{ uri: ssoApp.logoUrl }} style={styles.appIcon} />
                            <Text style={styles.loginTitle}>{ssoApp.appName}</Text>
                            <Text style={styles.loginSubtitle}>wants you to log in to</Text>
                            <TouchableOpacity onPress={() => Linking.openURL(ssoApp.origin)}>
                                <Text style={styles.appLink}>{ssoApp.origin.replace(/^https?:\/\//, '')}</Text>
                            </TouchableOpacity>
                            <View style={styles.usernameContainer}>
                                <Text style={styles.username}>@{username}</Text>
                            </View>
                        </View>
                    )}

                    <SSOLoginBottomLayover refMessage={refMessage} />
                </ScrollView>
            }
            footerHint={
                <TouchableOpacity style={styles.promptCard} onPress={() => refMessage?.current?.open()}>
                    <Text style={styles.promptText}>Instant and secure access, made easy</Text>
                    <ArrowUpRight width={20} height={20} />
                </TouchableOpacity>
            }
            footer={
                <View style={{ marginTop: 30 }}>
                    <TButtonContained disabled={nextLoading} style={commonStyles.marginBottom} onPress={onLogin}>
                        Proceed
                    </TButtonContained>
                    <TButtonOutlined disabled={cancelLoading} onPress={onCancel}>
                        Cancel
                    </TButtonOutlined>
                </View>
            }
        ></LayoutComponent>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        textAlign: 'center',
        paddingBottom: 50,
    },
    appIcon: {
        width: 50,
        height: 50,
        marginBottom: 12,
    },
    loginSubtitle: {
        fontSize: 22,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 2,
    },
    loginCard: {
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 28,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        marginBottom: 30,
        marginTop: 70,
    },
    promptText: {
        flex: 1,
        fontSize: 14,
        color: 'black',
    },
    loginTitle: {
        fontSize: 22,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 0,
        paddingBottom: 0,
    },
    appLink: {
        fontSize: 18,
        color: theme.colors.primary,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    usernameContainer: {
        backgroundColor: '#0000000D',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginTop: 10,
    },
    username: {
        fontSize: 14,
        color: 'black',
    },
    promptCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundGray,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginTop: 30,
        paddingVertical: 18,
    },
    progressBarContainer: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    progressActive: {
        flex: 1,
        height: 4,
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
    },
    progressInactive: {
        flex: 1,
        height: 4,
        backgroundColor: '#ECF1F4',
        marginLeft: 4,
        borderRadius: 2,
    },
});

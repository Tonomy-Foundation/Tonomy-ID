import React, { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { Image, StyleSheet, View } from 'react-native';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import TInfoBox from '../components/TInfoBox';
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
import { TH1, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import { commonStyles } from '../utils/theme';
import settings from '../settings';
import useErrorStore from '../store/errorStore';
import { useNavigation } from '@react-navigation/native';
import { Images } from '../assets';
import Debug from 'debug';
import { SafeAreaView } from 'react-native-safe-area-context';

const debug = Debug('tonomy-id:containers:SSOLoginContainer');

export default function SSOLoginContainer({ payload, platform }: { payload: string; platform: 'mobile' | 'browser' }) {
    const { user, logout } = useUserStore();
    const [responsesManager, setResponsesManager] = useState<ResponsesManager>();
    const [username, setUsername] = useState<string>();
    const [ssoApp, setSsoApp] = useState<App>();
    const [nextLoading, setNextLoading] = useState<boolean>(true);
    const [cancelLoading, setCancelLoading] = useState<boolean>(false);

    const navigation = useNavigation();
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
                // @ts-expect-error item of type string is not assignable to type never
                navigation.navigate('Assets');
            } else {
                // @ts-expect-error item of type string is not assignable to type never
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
                // @ts-expect-error item of type string is not assignable to type never
                navigation.navigate('Assets');
            } else {
                errorStore.setError({
                    error: e,
                    expected: false,
                    // @ts-expect-error item of type string is not assignable to type never
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

            // @ts-expect-error item of type string is not assignable to type never
            // TODO: fix type error
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
                // @ts-expect-error item of type string is not assignable to type never
                navigation.navigate('Assets');
            } else {
                errorStore.setError({
                    error: e,
                    expected: false,
                    // @ts-expect-error item of type string is not assignable to type never
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
                <View style={styles.container}>
                    <SafeAreaView>
                        <Image
                            style={[styles.logo, commonStyles.marginBottom]}
                            source={Images.GetImage('logo1024')}
                        ></Image>
                    </SafeAreaView>
                    {username && <TH1 style={commonStyles.textAlignCenter}>{username}</TH1>}

                    {ssoApp && (
                        <View style={[styles.appDialog, styles.marginTop]}>
                            <Image style={styles.appDialogImage} source={{ uri: ssoApp.logoUrl }} />
                            <TH1 style={commonStyles.textAlignCenter}>{ssoApp.appName}</TH1>
                            <TP style={commonStyles.textAlignCenter}>Wants you to log in to their application here:</TP>
                            <TLink to={ssoApp.origin}>{ssoApp.origin}</TLink>
                        </View>
                    )}
                </View>
            }
            footerHint={
                <View style={styles.infoBox}>
                    <TInfoBox
                        align="left"
                        icon="security"
                        description="100% secure. Only your phone can authorize your app login."
                        linkUrl={settings.config.links.securityLearnMore}
                        linkUrlText="Learn more"
                    />
                </View>
            }
            footer={
                <View>
                    <TButtonContained disabled={nextLoading} style={commonStyles.marginBottom} onPress={onLogin}>
                        Login
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
    },
    logo: {
        width: 100,
        height: 100,
    },
    appDialog: {
        borderWidth: 1,
        borderColor: 'grey',
        borderStyle: 'solid',
        borderRadius: 8,
        padding: 16,
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        minHeight: 200,
    },
    appDialogImage: {
        aspectRatio: 1,
        height: 50,
        resizeMode: 'contain',
    },
    marginTop: {
        marginTop: 10,
    },
    infoBox: {
        marginBottom: 32,
    },
    checkbox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

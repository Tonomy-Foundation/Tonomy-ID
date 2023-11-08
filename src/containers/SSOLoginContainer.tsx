import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import TInfoBox from '../components/TInfoBox';
import useUserStore from '../store/userStore';
import {
    UserApps,
    App,
    LoginRequest,
    base64UrlToObj,
    SdkErrors,
    CommunicationError,
    LoginRequestsMessage,
    ResponsesManager,
    RequestsManager,
} from '@tonomy/tonomy-id-sdk';
import { TH1, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import { commonStyles } from '../utils/theme';
import settings from '../settings';
import useErrorStore from '../store/errorStore';
import { openBrowserAsync } from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';

export default function SSOLoginContainer({ payload, platform }: { payload: string; platform: 'mobile' | 'browser' }) {
    const { user, logout } = useUserStore();
    // const [app, setApp] = useState<App>();
    const [responsesManager, setResponsesManager] = useState<ResponsesManager>();
    // const [appLoginRequest, setAppLoginRequest] = useState<LoginRequest>();
    const [username, setUsername] = useState<string>();
    const [ssoApp, setSsoApp] = useState<App>();
    // const [ssoLoginRequest, setSsoLoginRequest] = useState<LoginRequest>();
    // const [receiverDid, setReceiverDid] = useState<string>();
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
            const parsedPayload = base64UrlToObj(payload);
            const managedRequests = new RequestsManager(parsedPayload?.requests);

            await managedRequests.verify();
            // TODO check if the internal login request comes from same DID as the sender of the message.

            const managedResponses = new ResponsesManager(managedRequests);

            await managedResponses.fetchMeta({ accountName: await user.getAccountName() });

            setSsoApp(managedResponses.getExternalLoginResponseOrThrow().getAppOrThrow());
            setResponsesManager(managedResponses);

            setNextLoading(false);
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function onNext() {
        try {
            setNextLoading(true);
            if (!responsesManager) throw new Error('Responses manager is not set');

            await responsesManager.createResponses(user);

            const callbackUrl = await user.apps.acceptLoginRequest(responsesManager, platform, {
                callbackPath: responsesManager.getAccountsLoginRequestOrThrow().getPayload().callbackPath,
                callbackOrigin: responsesManager.getAccountsLoginRequestOrThrow().getPayload().origin,
                messageRecipient: responsesManager.getAccountsLoginRequestsIssuerOrThrow(),
            });

            setNextLoading(false);

            if (platform === 'mobile') {
                if (typeof callbackUrl !== 'string') throw new Error('Callback url is not string');
                await openBrowserAsync(callbackUrl);
            } else {
                // @ts-expect-error item of type string is not assignable to type never
                // TODO fix type error
                navigation.navigate('Drawer', { screen: 'UserHome' });
            }
        } catch (e) {
            setNextLoading(false);

            if (
                e instanceof CommunicationError &&
                e.exception.status === 400 &&
                e.exception.message.startsWith('Recipient not connected')
            ) {
                // User cancelled in the browser, so can just navigate back to home
                // @ts-expect-error item of type string is not assignable to type never
                navigation.navigate('Drawer', { screen: 'UserHome' });
            } else {
                errorStore.setError({
                    error: e,
                    expected: false,
                    // @ts-expect-error item of type string is not assignable to type never
                    onClose: async () => navigation.navigate('Drawer', { screen: 'UserHome' }),
                });
            }
        }
    }

    async function onCancel() {
        try {
            setCancelLoading(true);
            if (!responsesManager) throw new Error('Responses manager is not set');

            const res = await UserApps.terminateLoginRequest(
                responsesManager,
                platform,
                {
                    code: SdkErrors.UserCancelled,
                    reason: 'User cancelled login request',
                },
                {
                    callbackPath: responsesManager.getAccountsLoginRequestOrThrow().getPayload().callbackPath,
                    callbackOrigin: responsesManager.getAccountsLoginRequestOrThrow().getPayload().origin,
                    messageRecipient: responsesManager.getAccountsLoginRequestsIssuerOrThrow(),
                    user,
                }
            );

            if (platform === 'mobile') {
                setNextLoading(false);
                if (typeof res !== 'string') throw new Error('Res is not string');
                await openBrowserAsync(res);
            } else {
                setNextLoading(false);
                // @ts-expect-error item of type string is not assignable to type never
                // TODO fix type error
                navigation.navigate('Drawer', { screen: 'UserHome' });
            }
        } catch (e) {
            setCancelLoading(false);

            if (
                e instanceof CommunicationError &&
                e.exception.status === 400 &&
                e.exception.message.startsWith('Recipient not connected')
            ) {
                // User cancelled in the browser, so can just navigate back to home
                // @ts-expect-error item of type string is not assignable to type never
                navigation.navigate('Drawer', { screen: 'UserHome' });
            } else {
                errorStore.setError({
                    error: e,
                    expected: false,
                    // @ts-expect-error item of type string is not assignable to type never
                    onClose: async () => navigation.navigate('Drawer', { screen: 'UserHome' }),
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
                    <Image
                        style={[styles.logo, commonStyles.marginBottom]}
                        source={require('../assets/tonomy/tonomy-logo1024.png')}
                    ></Image>

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
                    <TButtonContained disabled={nextLoading} style={commonStyles.marginBottom} onPress={onNext}>
                        Next
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

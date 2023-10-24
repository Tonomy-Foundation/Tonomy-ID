import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
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
} from '@tonomy/tonomy-id-sdk';
import { TH1, TH2, TH4 } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import theme, { commonStyles } from '../utils/theme';
import settings from '../settings';
import useErrorStore from '../store/errorStore';
import { openBrowserAsync } from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import { throwError } from '../utils/errors';
import { ApplicationErrors } from '../utils/errors';
import TList from '../components/TList';
import { IconButton } from 'react-native-paper';

export default function DataSharingConsentContainer({
    payload,
    platform,
}: {
    payload: string;
    platform: 'mobile' | 'browser';
}) {
    const { user, logout } = useUserStore();
    const [app, setApp] = useState<App>();
    const [appLoginRequest, setAppLoginRequest] = useState<LoginRequest>();
    const [username, setUsername] = useState<string>();
    const [ssoApp, setSsoApp] = useState<App>();
    const [ssoLoginRequest, setSsoLoginRequest] = useState<LoginRequest>();
    const [receiverDid, setReceiverDid] = useState<string>();
    const [nextLoading, setNextLoading] = useState<boolean>(true);
    const [cancelLoading, setCancelLoading] = useState<boolean>(false);

    const navigation = useNavigation();
    const errorStore = useErrorStore();

    async function setUserName() {
        try {
            const username = await user.getUsername();

            if (!username) {
                await logout();
            }

            setUsername(username.getBaseUsername());
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function getLoginRequestFromParams() {
        try {
            const parsedPayload = base64UrlToObj(payload);

            if (!parsedPayload || !parsedPayload.requests)
                throwError('No requests found in payload', ApplicationErrors.MissingParams);

            const requests: LoginRequest[] = parsedPayload.requests.map((r: string) => new LoginRequest(r));

            await UserApps.verifyRequests(requests);

            for (const request of requests) {
                const payload = request.getPayload();
                const app = await App.getApp(payload.origin);

                if (payload.origin === settings.config.ssoWebsiteOrigin) {
                    setAppLoginRequest(request);
                    setReceiverDid(request.getIssuer());
                    setApp(app);
                } else {
                    setSsoLoginRequest(request);
                    setSsoApp(app);
                }
            }

            setNextLoading(false);
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function onNext() {
        try {
            setNextLoading(true);
            if (!app || !appLoginRequest || !ssoApp || !ssoLoginRequest) throw new Error('Missing params');
            const callbackUrl = await user.apps.acceptLoginRequest(
                [
                    { app: ssoApp, request: ssoLoginRequest },
                    { app, request: appLoginRequest },
                ],
                platform,
                receiverDid
            );

            setNextLoading(false);

            if (platform === 'mobile') {
                await openBrowserAsync(callbackUrl as string);
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
            if (!ssoLoginRequest || !appLoginRequest) throw new Error('Missing params');
            const res = await UserApps.terminateLoginRequest(
                [ssoLoginRequest, appLoginRequest],
                platform === 'browser' ? 'message' : 'url',
                {
                    code: SdkErrors.UserCancelled,
                    reason: 'User cancelled login request',
                },
                {
                    issuer: await user.getIssuer(),
                    messageRecipient: receiverDid,
                }
            );

            if (platform === 'mobile') {
                setNextLoading(false);
                await openBrowserAsync(res as string);
            } else {
                setNextLoading(false);
                await user.communication.sendMessage(res as LoginRequestsMessage);
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
        getLoginRequestFromParams();
    }, []);

    return (
        <LayoutComponent
            body={
                <View style={styles.container}>
                    <Image width={8} height={8} source={require('../assets/tonomy/Tonomy-Foundation.png')}></Image>
                    {username && <TH1 style={commonStyles.textAlignCenter}>{username}</TH1>}
                    {ssoApp && (
                        <View style={styles.ssoContainer}>
                            <Image width={8} height={8} source={{ uri: ssoApp.logoUrl }}></Image>
                            <TH2 style={[commonStyles.textAlignCenter, styles.marginTop]}>{ssoApp.appName}</TH2>
                            <TLink style={commonStyles.textAlignCenter} to={ssoApp.origin}>
                                {ssoApp.origin}
                            </TLink>
                            <Text style={[commonStyles.textAlignCenter, styles.marginTop]}>
                                Is requesting access to following data:
                            </Text>
                        </View>
                    )}
                    <View style={styles.boarderPanel}>
                        <View style={{ flexDirection: 'row' }}>
                            <IconButton
                                color={theme.colors.grey2}
                                style={styles.iconButton}
                                icon="account-circle-outline"
                            ></IconButton>
                            <TH4 style={styles.panelHeading}>Profile Information</TH4>
                            <IconButton
                                color={theme.colors.grey2}
                                onPress={() => alert()}
                                style={styles.rightIcon}
                                icon="clipboard-text-search-outline"
                            ></IconButton>
                        </View>

                        <View style={styles.list}>
                            <TList bulletIcon="•" text="Username" />
                            <TList bulletIcon="•" text="Anonymous User ID" />
                        </View>
                    </View>
                </View>
            }
            footerHint={
                <View style={styles.infoBox}>
                    <TInfoBox
                        align="left"
                        icon="security"
                        description="Your personal info is self-sovereign meaning only you control who you share it with!"
                        linkUrl="#"
                        linkUrlText=""
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
    ssoContainer: {
        marginTop: 10,
        textAlign: 'center',
    },
    boarderPanel: {
        borderRadius: 8,
        borderColor: '#000000',
        borderWidth: 1,
        marginHorizontal: 30,
        marginTop: 20,
        width: '90%',
    },
    iconButton: {
        marginLeft: 10,
    },
    panelHeading: {
        marginLeft: 5,
        marginTop: 14,
        fontWeight: '500',
    },
    rightIcon: {
        position: 'absolute',
        right: 0,
        marginLeft: 'auto',
    },
    list: { marginLeft: 67, marginBottom: 15, lineHeight: 15 },
});

import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import TInfoBox from '../components/TInfoBox';
import useUserStore, { UserStatus } from '../store/userStore';
import { UserApps, App, LoginRequest, base64UrlToObj, SdkErrors, CommunicationError } from '@tonomy/tonomy-id-sdk';
import { TH1, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import { commonStyles } from '../utils/theme';
import settings from '../settings';
import useErrorStore from '../store/errorStore';
import { openBrowserAsync } from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import { throwError } from '../utils/errors';
import { ApplicationErrors } from '../utils/errors';
import { CheckedRequest } from '@tonomy/tonomy-id-sdk';

type AppData = {
    app: App;
    loginRequest: LoginRequest;
    showConsent: boolean;
};

export default function SSOLoginContainer({
    payload,
    platform,
    checkedRequests,
}: {
    payload: string;
    platform: 'mobile' | 'browser';
    checkedRequests?: CheckedRequest[];
}) {
    const { user, setStatus } = useUserStore();
    const [username, setUsername] = useState<string>();
    const [sso, setSso] = useState<AppData>();
    const [externalApp, setExternalApp] = useState<AppData>();
    const [receiverDid, setReceiverDid] = useState<string>();
    const [nextLoading, setNextLoading] = useState<boolean>(true);
    const [cancelLoading, setCancelLoading] = useState<boolean>(false);

    const navigation = useNavigation();
    const errorStore = useErrorStore();

    async function setUserName() {
        try {
            const username = await user.getUsername();

            if (!username) {
                await user.logout();
                setStatus(UserStatus.NOT_LOGGED_IN);
            }

            setUsername(username.getBaseUsername());
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function getAndVerifyAppData() {
        try {
            const parsedPayload = base64UrlToObj(payload);

            if (!parsedPayload || !parsedPayload.requests)
                throwError('No requests found in payload', ApplicationErrors.MissingParams);

            const requests: LoginRequest[] = parsedPayload.requests.map((r: string) => new LoginRequest(r));

            const res = checkedRequests ?? (await user.apps.checkRequests(requests));

            for (const r of res) {
                if (r.ssoApp) {
                    setSso({ app: r.app, loginRequest: r.request, showConsent: r.requiresLogin });
                    setReceiverDid(r.requestDid);
                } else {
                    setExternalApp({ app: r.app, loginRequest: r.request, showConsent: r.requiresLogin });
                }
            }

            const isLoginRequired = res.reduce((accumulator, request) => accumulator && request.requiresLogin, true);

            if (!isLoginRequired) {
                onNext();
            }

            setNextLoading(false);
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function onNext() {
        try {
            setNextLoading(true);
            if (!externalApp || !sso) throw new Error('Missing params');
            const callbackUrl = await user.apps.acceptLoginRequest(
                [
                    { app: sso.app, request: sso.loginRequest, requiresLogin: sso.showConsent },
                    { app: externalApp.app, request: externalApp.loginRequest, requiresLogin: externalApp.showConsent },
                ],
                platform,
                receiverDid
            );

            setNextLoading(false);

            if (platform === 'mobile') {
                await openBrowserAsync(callbackUrl);
            } else {
                // @ts-expect-error item of type string is not assignable to type never
                // TODO fix type error
                navigation.navigate('Drawer', { screen: 'UserHome' });
            }
        } catch (e) {
            setNextLoading(false);

            if (e instanceof CommunicationError && e.exception.status === 404) {
                // User cancelled in the browser, so can just navigate back to home
                // @ts-expect-error item of type string is not assignable to type never
                // TODO fix type error
                navigation.navigate('Drawer', { screen: 'UserHome' });
            } else {
                errorStore.setError({
                    error: e,
                    expected: false,
                    // @ts-expect-error item of type string is not assignable to type never
                    // TODO fix type error
                    onClose: async () => navigation.navigate('Drawer', { screen: 'UserHome' }),
                });
            }
        }
    }

    async function onCancel() {
        try {
            setCancelLoading(true);
            if (!sso || !externalApp) throw new Error('Missing params');
            const res = await UserApps.terminateLoginRequest(
                [sso.loginRequest, externalApp.loginRequest],
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
                await openBrowserAsync(res);
            } else {
                setNextLoading(false);
                await user.communication.sendMessage(res);
                // @ts-expect-error item of type string is not assignable to type never
                // TODO fix type error
                navigation.navigate('Drawer', { screen: 'UserHome' });
            }
        } catch (e) {
            setCancelLoading(false);

            if (e instanceof CommunicationError && e.exception.status === 404) {
                // User cancelled in the browser, so can just navigate back to home
                // @ts-expect-error item of type string is not assignable to type never
                // TODO fix type error
                navigation.navigate('Drawer', { screen: 'UserHome' });
            } else {
                errorStore.setError({
                    error: e,
                    expected: false,
                    // @ts-expect-error item of type string is not assignable to type never
                    // TODO fix type error
                    onClose: async () => navigation.navigate('Drawer', { screen: 'UserHome' }),
                });
            }
        }
    }

    useEffect(() => {
        setUserName();
        getAndVerifyAppData();
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

                    {externalApp && (
                        <View style={[styles.appDialog, styles.marginTop]}>
                            <Image style={styles.appDialogImage} source={{ uri: externalApp.app.logoUrl }} />
                            <TH1 style={commonStyles.textAlignCenter}>{externalApp.app.appName}</TH1>
                            <TP style={commonStyles.textAlignCenter}>Wants you to log in to their application here:</TP>
                            <TLink to={externalApp.app.origin}>{externalApp.app.origin}</TLink>
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

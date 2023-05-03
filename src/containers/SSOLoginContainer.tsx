import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LayoutComponent from '../components/layout';
import TonomyLogo from '../assets/tonomy/tonomy-logo1024.png';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import TInfoBox from '../components/TInfoBox';
import TCheckbox from '../components/molecules/TCheckbox';
import useUserStore, { UserStatus } from '../store/userStore';
import {
    UserApps,
    App,
    LoginRequest,
    LoginRequestPayload,
    LoginRequestResponseMessage,
    base64UrlToObj,
    objToBase64Url,
    SdkErrors,
} from '@tonomy/tonomy-id-sdk';
import { TH1, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import { commonStyles } from '../utils/theme';
import settings from '../settings';
import useErrorStore from '../store/errorStore';
import { openBrowserAsync } from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import { throwError } from '../utils/errors';
import { ApplicationErrors } from '../utils/errors';

export default function SSOLoginContainer({ payload, platform }: { payload: string; platform: 'mobile' | 'browser' }) {
    const { user, setStatus } = useUserStore();
    const [app, setApp] = useState<App>();
    const [appLoginRequest, setAppLoginRequest] = useState<LoginRequest>();
    const [checked, setChecked] = useState<'checked' | 'unchecked' | 'indeterminate'>('unchecked');
    const [username, setUsername] = useState<string>();
    const [ssoApp, setSsoApp] = useState<App>();
    const [ssoLoginRequest, setSsoLoginRequest] = useState<LoginRequest>();
    const [receiverDid, setReceiverDid] = useState<string>();
    const [nextLoading, setNextLoading] = useState<boolean>(false);
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
        } catch (e: any) {
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
        } catch (e: any) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function onNext() {
        try {
            setNextLoading(true);
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
                await openBrowserAsync(callbackUrl);
            } else {
                navigation.navigate('Drawer', { screen: 'UserHome' });
            }
        } catch (e: any) {
            setNextLoading(false);
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function onCancel() {
        try {
            setCancelLoading(true);
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
                await openBrowserAsync(res);
            } else {
                setNextLoading(false);
                await user.communication.sendMessage(res);
                navigation.navigate('Drawer', { screen: 'UserHome' });
            }
        } catch (e: any) {
            setCancelLoading(false);
            errorStore.setError({ error: e, expected: false });
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
                    <Image style={[styles.logo, commonStyles.marginBottom]} source={TonomyLogo}></Image>

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

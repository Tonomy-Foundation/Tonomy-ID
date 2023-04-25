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
    TonomyUsername,
    LoginRequest,
    LoginRequestPayload,
    LoginRequestResponseMessage,
} from '@tonomy/tonomy-id-sdk';
import { TH1, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import { commonStyles } from '../utils/theme';
import settings from '../settings';
import useErrorStore from '../store/errorStore';
import { openBrowserAsync } from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';

export default function SSOLoginContainer({
    requests,
    platform,
}: {
    requests: LoginRequest[];
    platform: 'mobile' | 'browser';
}) {
    const { user, setStatus } = useUserStore();
    const [app, setApp] = useState<App>();
    const [checked, setChecked] = useState<'checked' | 'unchecked' | 'indeterminate'>('unchecked');
    const [username, setUsername] = useState<TonomyUsername>();
    const [tonomyLoginRequestPayload, setTonomyLoginRequestPayload] = useState<LoginRequestPayload>();
    const [ssoLoginRequestPayload, setSsoLoginRequestPayload] = useState<LoginRequestPayload>();
    const [ssoApp, setSsoApp] = useState<App>();
    const [recieverDid, setRecieverDid] = useState<string>();

    const navigation = useNavigation();
    const errorStore = useErrorStore();

    async function setUserName() {
        try {
            const username = await user.storage.username;

            if (!username) {
                await user.logout();
                setStatus(UserStatus.NOT_LOGGED_IN);
            }

            if (!username.username) {
                throw new Error('Username not found');
            }

            setUsername(username);
        } catch (e: any) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function getLoginFromJwt() {
        try {
            await UserApps.verifyRequests(requests);

            for (const request of requests) {
                const payload = request.getPayload();
                const app = await App.getApp(payload.origin);

                if (payload.origin === settings.config.ssoWebsiteOrigin) {
                    setTonomyLoginRequestPayload(payload);
                    setRecieverDid(request.getSender());
                    setApp(app);
                } else {
                    setSsoLoginRequestPayload(payload);
                    setSsoApp(app);
                }
            }
        } catch (e: any) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    function toggleCheckbox() {
        setChecked((state) => (state === 'checked' ? 'unchecked' : 'checked'));
    }

    async function onNext() {
        try {
            const accountName = await user.storage.accountName;

            if (ssoApp && ssoLoginRequestPayload)
                await user.apps.loginWithApp(ssoApp, ssoLoginRequestPayload.publicKey);

            if (app && tonomyLoginRequestPayload && checked === 'checked') {
                await user.apps.loginWithApp(app, tonomyLoginRequestPayload.publicKey);
            }

            if (platform === 'mobile') {
                // TODO need to fix this to be base64Url
                let callbackUrl = settings.config.ssoWebsiteOrigin + '/callback?';

                callbackUrl += 'requests=' + requests;
                callbackUrl += '&username=' + (await user.storage.username);
                callbackUrl += '&accountName=' + accountName.toString();

                await openBrowserAsync(callbackUrl);
            } else {
                const issuer = await user.getIssuer();
                const message = await LoginRequestResponseMessage.signMessage(
                    {
                        success: true,
                        requests,
                        accountName,
                        username: await user.getUsername(),
                    },
                    issuer,
                    recieverDid
                );

                await user.communication.sendMessage(message);
                navigation.navigate('Drawer', { screen: 'UserHome' });
            }
        } catch (e: any) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function onCancel() {
        // TODO send a message to the sso website that the login was cancelled
        navigation.navigate('UserHome');
    }

    useEffect(() => {
        setUserName();
        getLoginFromJwt();
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

                    <View style={styles.checkbox}>
                        <TCheckbox status={checked} onPress={toggleCheckbox}></TCheckbox>
                        <TP>Stay signed in</TP>
                    </View>
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
                    <TButtonContained style={commonStyles.marginBottom} onPress={onNext}>
                        Next
                    </TButtonContained>
                    <TButtonOutlined onPress={onCancel}>Cancel</TButtonOutlined>
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

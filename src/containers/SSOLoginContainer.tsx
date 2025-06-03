import React, { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { Image, StyleSheet, View } from 'react-native';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import TInfoBox from '../components/TInfoBox';
import useUserStore from '../store/userStore';
import { rejectLoginRequest, App, SdkErrors, DualWalletRequests, CommunicationError } from '@tonomy/tonomy-id-sdk';
import { TH1, TP } from '../components/atoms/THeadings';
import TLink from '../components/atoms/TA';
import { commonStyles } from '../utils/theme';
import settings from '../settings';
import useErrorStore from '../store/errorStore';
import { Images } from '../assets';
import Debug from 'debug';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SSOLoginScreenProps } from '../screens/SSOLoginScreen';

const debug = Debug('tonomy-id:containers:SSOLoginContainer');

export default function SSOLoginContainer({
    payload,
    receivedVia,
    navigation,
}: {
    payload: string;
    receivedVia: 'deepLink' | 'message';
    navigation: SSOLoginScreenProps['navigation'];
}) {
    const { user, logout } = useUserStore();
    const [dualRequests, setDualRequests] = useState<DualWalletRequests>();
    const [username, setUsername] = useState<string>();
    const [ssoApp, setSsoApp] = useState<App>();
    const [nextLoading, setNextLoading] = useState<boolean>(true);
    const [cancelLoading, setCancelLoading] = useState<boolean>(false);

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
            const requests = DualWalletRequests.fromString(payload);

            debug(
                'getRequestsFromParams(): requests',
                requests.external.getRequests().length,
                requests.sso?.getRequests().length
            );

            setSsoApp(await requests.external.getApp());
            setDualRequests(requests);
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

            if (!dualRequests) throw new Error('dualRequests manager is not set');

            const callbackUrl = await user.acceptLoginRequest(
                dualRequests,
                receivedVia === 'deepLink' ? 'redirect' : 'message'
            );

            debug('onLogin() callbackUrl:', callbackUrl);

            if (receivedVia === 'deepLink') {
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
            if (!dualRequests) throw new Error('dualRequests is not set');

            const redirectUrl = await rejectLoginRequest(
                dualRequests,
                receivedVia === 'deepLink' ? 'redirect' : 'message',
                {
                    code: SdkErrors.UserCancelled,
                    reason: 'User cancelled login request',
                },
                {
                    user,
                }
            );

            setNextLoading(false);

            if (receivedVia === 'deepLink') {
                if (typeof redirectUrl !== 'string') throw new Error('redirectUrl is not string');
                await Linking.openURL(redirectUrl);
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
        width: 80,
        height: 80,
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

import React, { useEffect, useRef, useState } from 'react';
import * as Linking from 'expo-linking';
import { Image, StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import LayoutComponent from '../components/layout';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import useUserStore from '../store/userStore';
import {
    rejectLoginRequest,
    SdkErrors,
    CommunicationError,
    DualWalletRequests,
    WalletRequest,
    DataSharingRequestPayload,
    VerificationTypeEnum,
    KYCVC,
} from '@tonomy/tonomy-id-sdk';
import theme, { commonStyles } from '../utils/theme';
import useErrorStore from '../store/errorStore';
import Debug from 'debug';
import { SSOLoginScreenProps } from '../screens/SSOLoginScreen';
import TInfoModalBox from '../components/TInfoModalBox';
import SSOLoginBottomLayover from '../components/SSOLoginBottomLayover';
import { useVerificationStore } from '../store/verificationStore';
import RBSheet from 'react-native-raw-bottom-sheet';
import TIconButton from '../components/TIconButton';

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
    const { ssoApp, dualRequests, setDualRequests, setSsoApp, setReceivedVia, clearAuth, setUsernameRequested } =
        useVerificationStore();
    const [username, setUsername] = useState<string>();
    const [nextLoading, setNextLoading] = useState<boolean>(true);
    const [cancelLoading, setCancelLoading] = useState<boolean>(false);
    const [reuseKycCount, setReuseKycCount] = useState<number>(0);
    const [requestType, setRequestType] = useState<'login' | 'kyc'>('login');
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
            setReceivedVia(receivedVia);
            const requests = DualWalletRequests.fromString(payload);
            // Check request types
            const externalRequests = requests.external.getRequests();
            const hasKycRequest = externalRequests
                .filter(WalletRequest.isDataSharingRequest)
                .some((req) => (req as DataSharingRequestPayload).data.kyc === true);

            if (hasKycRequest) {
                setRequestType('kyc');
            } else {
                setRequestType('login');
            }

            const hasUsernameRequested = externalRequests
                .filter(WalletRequest.isDataSharingRequest)
                .some((req) => (req as DataSharingRequestPayload).data.username === true);

            setUsernameRequested(hasUsernameRequested);
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
        setNextLoading(true);
        debug('onLogin() logs start:', requestType);

        if (requestType === 'kyc') {
            try {
                const vc = (await user?.fetchVerificationData(VerificationTypeEnum.KYC)) as KYCVC;

                if (vc) {
                    navigation.navigate('VeriffDataSharing', {
                        payload: vc.getPayload(),
                    });
                }
            } catch (e) {
                if (e.code === SdkErrors.VerificationDataNotFound) {
                    navigation.navigate('VeriffLogin');
                } else {
                    errorStore.setError({ error: e, expected: false });
                }
            } finally {
                setNextLoading(false);
            }
        } else {
            try {
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
                clearAuth();
            }
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
        } finally {
            clearAuth();
        }
    }

    async function getKycReuseableCount() {
        try {
            const count = await user.fetchReuseableKycCount(VerificationTypeEnum.KYC);

            debug('getKycReuseableCount() count:', count);
            setReuseKycCount(count);
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    useEffect(() => {
        setUserName();
        getRequestsFromParams();
        getKycReuseableCount();
    }, []);

    return (
        <LayoutComponent
            body={
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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

                    <Image source={require('../assets/images/kyc-onboarding/verifiedRequest.png')} />
                    <SSOLoginBottomLayover refMessage={refMessage} />
                    <RBSheet
                        ref={refMessage}
                        openDuration={150}
                        closeDuration={100}
                        height={280}
                        customStyles={{ container: { paddingHorizontal: 10 } }}
                    >
                        <View style={styles.vestHead}>
                            <Text style={styles.drawerHead}>Before we continue</Text>
                            <TouchableOpacity onPress={() => refMessage?.current?.close()}>
                                <TIconButton
                                    icon={'close'}
                                    color={theme.colors.lightBg}
                                    iconColor={theme.colors.grey1}
                                    size={17}
                                />
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Text style={styles.lockedParagraph}>Here’s how identity verification works:</Text>
                            <Text style={styles.lockedParagraph}>⛶ We’ll check if you’re already verified</Text>
                            <Text style={styles.lockedParagraph}>🪪 If needed, scan your ID once</Text>
                            <TButtonContained style={{ marginTop: 30 }} onPress={onLogin}>
                                Got It
                            </TButtonContained>
                        </View>
                    </RBSheet>
                </ScrollView>
            }
            footerHint={
                <View>
                    <TInfoModalBox
                        description="Instant and secure access, made easy"
                        modalTitle="Instant and secure access"
                        modalDescription="Enjoy a faster and more secure login experience without going through unnecessary steps. With reusable identity, you stay in control of your data while accessing services seamlessly across platforms"
                    />
                </View>
            }
            footer={
                <View style={{ marginTop: 30 }}>
                    <TButtonContained
                        disabled={nextLoading}
                        style={commonStyles.marginBottom}
                        onPress={requestType === 'kyc' ? () => refMessage.current?.open() : onLogin}
                    >
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
        marginBottom: 20,
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
    vestHead: {
        paddingHorizontal: 5,
        paddingVertical: 13,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    drawerHead: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 8,
    },
    lockedParagraph: {
        fontSize: 18,
        fontWeight: '400',
        color: theme.colors.black,
        marginTop: 6,
        paddingHorizontal: 10,
    },
});

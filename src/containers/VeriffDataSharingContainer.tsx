import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { TButtonContained, TButtonOutlined } from '../components/atoms/TButton';
import theme, { commonStyles } from '../utils/theme';
import { ArrowUpRight, NavArrowUp, NavArrowDown } from 'iconoir-react-native';
import { Props } from '../screens/VeriffDataSharingScreen';
import { CommunicationError, KYCPayload, rejectLoginRequest, SdkErrors } from '@tonomy/tonomy-id-sdk';
import { Images } from '../assets';
import { useVerificationStore } from '../store/verificationStore';
import useUserStore from '../store/userStore';
import useErrorStore from '../store/errorStore';
import Debug from 'debug';

const debug = Debug('tonomy-id:containers:VeriffDataSharingContainer');

export default function VeriffDataSharingContainer({
    navigation,
    payload,
}: {
    navigation: Props['navigation'];
    payload: KYCPayload;
}) {
    const { ssoApp, dualRequests, receivedVia, clearAuth, isUsernameRequested } = useVerificationStore();
    const { user, logout } = useUserStore();
    const errorStore = useErrorStore();
    const [identityCollapsed, setIdentityCollapsed] = useState(false);
    const [personalCollapsed, setPersonalCollapsed] = useState(true);
    const [nextLoading, setNextLoading] = useState<boolean>(false);
    const [cancelLoading, setCancelLoading] = useState<boolean>(false);
    const [username, setUsername] = useState<string>();

    const person = payload.data.verification.person;
    const document = payload.data.verification.document;

    async function setUserName() {
        try {
            const username = await user?.getUsername();

            if (!username) {
                await logout('No username in SSO login screen');
            }

            setUsername(username?.getBaseUsername());
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    useEffect(() => {
        setUserName();
    }, []);

    const displayPersonData = (label: string, value: string) => {
        return (
            <View style={styles.row}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowValue}>{value}</Text>
            </View>
        );
    };

    const onAcceptRequest = async () => {
        try {
            setNextLoading(true);

            if (!dualRequests) throw new Error('dualRequests manager is not set');

            const callbackUrl = await user?.acceptLoginRequest(
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
    };

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

    return (
        <ScrollView style={styles.container}>
            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
                <View style={styles.progressActive} />
                <View style={styles.progressActive} />
                <View style={styles.progressActive} />
            </View>

            {/* Top Card */}
            <View style={styles.card}>
                <View style={styles.iconRow}>
                    <Image source={Images.GetImage('logo48')} style={styles.appIcon} />
                    <Text style={styles.dots}>. . .</Text>
                    <Image source={{ uri: ssoApp?.logoUrl }} style={styles.appIcon} />
                </View>
                <Text style={styles.shareText}>
                    Share data with <Text style={styles.discord}>{ssoApp?.appName}</Text>
                </Text>
                <View style={styles.usernameView}>
                    <Text style={styles.username}>@{username}</Text>
                </View>
            </View>

            {/* Reusable Identity Verification Section */}
            <View style={styles.sectionHeader}>
                <View style={styles.textContainer}>
                    <TouchableOpacity
                        style={styles.sectionWrapper}
                        onPress={() => setIdentityCollapsed(!identityCollapsed)}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <View style={{ flex: 1, marginRight: 20 }}>
                                <Text style={styles.sectionTitle}>Reusable Identity Verification</Text>
                                <Text style={styles.subTitle}>
                                    Saved you time 5 times already – your KYC data was reused seamlessly
                                </Text>
                            </View>

                            {identityCollapsed ? (
                                <NavArrowDown width={16} height={16} color={theme.colors.primary} />
                            ) : (
                                <NavArrowUp width={16} height={16} color={theme.colors.primary} />
                            )}
                        </View>
                    </TouchableOpacity>

                    {!identityCollapsed && (
                        <View style={styles.sectionContent}>
                            {person?.dateOfBirth?.value && displayPersonData('Date of birth', person.dateOfBirth.value)}
                            {person?.firstName?.value && displayPersonData('First name', person.firstName.value)}
                            {person?.lastName?.value && displayPersonData('Last name', person.lastName.value)}
                            {person?.gender?.value && displayPersonData('Gender', person.gender.value)}
                            {person?.nationality?.value && displayPersonData('Nationality', person.nationality.value)}
                            {document?.type?.value && displayPersonData('Document type', document.type.value)}
                            {document?.number?.value && displayPersonData('Document number', document.number.value)}
                        </View>
                    )}
                </View>
            </View>

            {/* Personal Data Section */}
            {isUsernameRequested && (
                <View style={styles.sectionHeader}>
                    <View style={styles.textContainer}>
                        <TouchableOpacity
                            style={styles.sectionWrapper}
                            onPress={() => setPersonalCollapsed(!personalCollapsed)}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <View style={{ flex: 1, marginRight: 20 }}>
                                    <Text style={styles.sectionTitle}>Personal Data</Text>
                                </View>

                                {personalCollapsed ? (
                                    <NavArrowDown width={16} height={16} color={theme.colors.primary} />
                                ) : (
                                    <NavArrowUp width={16} height={16} color={theme.colors.primary} />
                                )}
                            </View>
                        </TouchableOpacity>

                        {!personalCollapsed && (
                            <View style={styles.sectionContent}>
                                <View style={styles.row}>
                                    <Text style={styles.rowLabel}>Username</Text>
                                    <Text style={styles.rowValue}>{username}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Info Card */}
            <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                    Your personal info is self‑sovereign meaning only you control who you share it with!
                </Text>
                <ArrowUpRight width={16} height={16} />
            </View>

            {/* Spacer to push footer into view */}
            <View style={{ height: 20 }} />
            <TButtonContained style={commonStyles.marginBottom} disabled={nextLoading} onPress={onAcceptRequest}>
                Share & Login
            </TButtonContained>
            <TButtonOutlined size="large" disabled={cancelLoading} onPress={onCancel}>
                Cancel
            </TButtonOutlined>
            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    textContainer: {
        flex: 1, // Let it fill the space
        flexDirection: 'column',
        marginRight: 10, // Add some space between text and chevron
    },
    title: { fontSize: 18, fontWeight: '600', textAlign: 'center', paddingVertical: 12 },
    container: { paddingHorizontal: 16, paddingBottom: 20 },
    progressBarContainer: { flexDirection: 'row', marginVertical: 16 },
    progressActive: { flex: 1, height: 4, backgroundColor: theme.colors.primary, borderRadius: 2, marginRight: 4 },
    progressInactive: { flex: 1, height: 4, backgroundColor: '#ECF1F4', borderRadius: 2 },
    card: { backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 7 },
    iconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 10 },
    appIcon: { width: 40, height: 40, resizeMode: 'contain' },
    dots: { marginHorizontal: 15, marginBottom: 20, fontSize: 35, color: theme.colors.grey9 },
    shareText: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
    discord: { color: theme.colors.primary },
    sectionWrapper: { paddingVertical: 9, paddingLeft: 9 },
    usernameView: {
        borderRadius: 15,
        backgroundColor: theme.colors.grey6,
        paddingVertical: 6,
        paddingHorizontal: 8,
        marginTop: 8,
    },

    username: {
        borderRadius: 63,
        color: theme.colors.black,
    },
    subTitle: {
        color: theme.colors.grey9,
        fontSize: 12,
        marginTop: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        padding: 9,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    sectionContent: {
        padding: 9,
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: 12,
    },
    noteText: { color: theme.colors.grey7, marginBottom: 12 },
    row: { flexDirection: 'column', justifyContent: 'space-between', marginBottom: 8 },
    rowLabel: { color: theme.colors.grey9, fontSize: 12 },
    rowValue: { marginTop: 2, fontSize: 13 },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.grey7,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 18,
        marginBottom: 24,
    },
    infoText: { flex: 1, fontSize: 16, marginRight: 8 },
    footerButtons: { paddingHorizontal: 16, paddingBottom: 24 },
});

import {  BarcodeScanningResult } from 'expo-camera';
import { CommunicationError, IdentifyMessage, isErrorCode, SdkErrors, validateQrCode } from '@tonomy/tonomy-id-sdk';
import useUserStore from '../store/userStore';
import settings from '../settings';
import Debug from 'debug';
import useErrorStore from '../store/errorStore';
import { ScanQRScreenProps } from '../screens/ScanQRScreen';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Images } from '../assets';
import QRCodeScanner from '../components/QRCodeScanner';
import theme, { commonStyles } from '../utils/theme';
import { isNetworkError, NETWORK_ERROR_RESPONSE } from '../utils/errors';
import { useCallback, useEffect, useState } from 'react';
import TSpinner from '../components/atoms/TSpinner';
import { useSessionStore } from '../store/sessionStore';

const debug = Debug('tonomy-id:containers:ScanQRCodeContainer');

export type ScanQRContainerProps = {
    did;
    navigation: ScanQRScreenProps['navigation'];
};
export default function ScanQRCodeContainer({
    did,
    navigation,
}: {
    did?: string;
    navigation: ScanQRContainerProps['navigation'];
}) {
    const userStore = useUserStore();
    const user = userStore.user;
    const errorStore = useErrorStore();
    const [accountName, setAccountName] = useState('');
    const [isLoadingView, setIsLoadingView] = useState(false);

    const { walletConnectSession, antelopeSession } = useSessionStore.getState();

    const setUserName = useCallback(async () => {
        try {
            const accountName = (await user.getAccountName()).toString();

            setAccountName(accountName);
        } catch (e) {
            if (isNetworkError(e)) {
                debug('setUserName() network error');
            } else errorStore.setError({ error: e, expected: false });
        }
    }, [user, errorStore]);

    const connectToDid = useCallback(
        async (did: string) => {
            try {
                // Connect to the browser using their did:jwk
                const issuer = await user.getIssuer();
                const identifyMessage = await IdentifyMessage.signMessage({}, issuer, did);

                await user.sendMessage(identifyMessage);
            } catch (e) {
                if (
                    e instanceof CommunicationError &&
                    e.exception?.status === 400 &&
                    e.exception.message.startsWith('Recipient not connected')
                ) {
                    errorStore.setError({
                        title: 'Problem connecting',
                        error: new Error("We couldn't connect to the website. Please refresh the page or try again."),
                        expected: true,
                    });
                } else {
                    debug('connectToDid() error:', e);

                    errorStore.setError({
                        error: e,
                        expected: false,
                    });
                }
            }
        },
        [user, errorStore]
    );

    const onUrlOpen = useCallback(
        async (did) => {
            try {
                await connectToDid(did);
            } catch (e) {
                if (isNetworkError(e)) {
                    debug('onUrlOpen() network error when connectToDid called');
                } else {
                    errorStore.setError({ error: e, expected: false });
                }
            }
        },
        [errorStore, connectToDid]
    );

    // setUserName() on mount
    useEffect(() => {
        setUserName();

        if (did) {
            onUrlOpen(did);
        }
    }, [setUserName, did, onUrlOpen]);

    async function onScan({ data }: BarcodeScanningResult) {
        debug('onScan() data:', data);
        setIsLoadingView(true);

        try {
            if (data.startsWith('wc:')) {
                await walletConnectSession?.onQrScan(data);
            } else if (data.startsWith('esr:')) {
                await antelopeSession?.onQrScan(data);
            } else {
                const did = validateQrCode(data);

                debug('onScan() validated did:', did);
                await connectToDid(did);
            }
        } catch (e) {
            debug('onScan() error:', e);

            if (isNetworkError(e)) {
                debug('onScan() network error');
                errorStore.setError({
                    title: 'Network Error',
                    error: new Error(NETWORK_ERROR_RESPONSE),
                    expected: true,
                });
            } else if (isErrorCode(e, SdkErrors.InvalidQrCode)) {
                debug('onScan() Invalid QR Code', JSON.stringify(e, null, 2));

                if (e.message === 'QR schema does not match app') {
                    errorStore.setError({
                        title: 'Invalid QR Code',
                        error: new Error(`This QR code cannot be used with ${settings.config.appName}`),
                        expected: true,
                    });
                } else {
                    errorStore.setError({
                        title: 'Invalid QR Code',
                        error: e,
                        expected: false,
                    });
                }
            } else if (e instanceof CommunicationError) {
                debug('onScan() CommunicationError QR Code', JSON.stringify(e, null, 2));
                errorStore.setError({
                    error: e,
                    expected: false,
                    title: 'Communication Error',
                });
            } else {
                errorStore.setError({ error: e, expected: false });
            }
        } finally {
            setTimeout(() => {
                setIsLoadingView(false);
            }, 7000);
        }
    }

    return (
        <View style={styles.content}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.QRContainer}>
                    {isLoadingView ? <TSpinner /> : <QRCodeScanner onScan={onScan} />}
                </View>
                <View style={styles.bottomInstruction}>
                    <Text style={{ fontWeight: '500', ...commonStyles.primaryFontFamily }}>
                        Login and sign crypto transactions using:
                    </Text>
                    <View style={styles.flexCol}>
                        <View style={styles.flexRow}>
                            <Image source={Images.GetImage('logo48')} style={styles.favicon} />
                            <Text>{settings.config.ecosystemName}</Text>
                        </View>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/crypto-transaction.png')} style={styles.favicon} />
                            <Text>WalletConnect</Text>
                        </View>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/anchor-codes.png')} style={styles.favicon} />
                            <Text>Anchor (Antelope)</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        padding: 16,
    },

    scrollViewContent: {
        flexGrow: 1,
    },
    bottomInstruction: {
        marginTop: 15,
        padding: 15,
        marginBottom: 40,
        backgroundColor: theme.colors.grey7,
        borderRadius: 16,
    },
    favicon: {
        width: 16,
        height: 16,
        borderRadius: 16,
    },
    flexCol: {
        flexDirection: 'column',
        gap: 10,
        marginTop: 10,
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    QRContainer: {
        flex: 1,
        borderRadius: 25,
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import TIconButton from '../components/TIconButton';
import theme from '../utils/theme';
import { BarCodeScannerResult } from 'expo-barcode-scanner';
import useWalletStore from '../store/useWalletStore';
import { CommunicationError, IdentifyMessage, SdkError, SdkErrors, validateQrCode } from '@tonomy/tonomy-id-sdk';
import useUserStore from '../store/userStore';
import Debug from 'debug';
import useErrorStore from '../store/errorStore';
import settings from '../settings';
import QRScanContainer from '../containers/QRScanContainer';
const debug = Debug('tonomy-id:containers:MainContainer');
export type QRScanProps = {
    refMessage: React.RefObject<any>;
    onClose: () => void;
    cryptoWallet?: boolean;
    onScan?: (address) => void;
};

const QRScan = (props: QRScanProps) => {
    const { web3wallet } = useWalletStore();
    const userStore = useUserStore();
    const user = userStore.user;
    const errorStore = useErrorStore();
    async function onScan({ data }: BarCodeScannerResult) {
        if (props.cryptoWallet) {
            const address = validateCryptoAddress(data);
            if (props.onScan) props.onScan(address);
        } else {
            try {
                if (data.startsWith('wc:')) {
                    if (web3wallet) await web3wallet.core.pairing.pair({ uri: data });
                } else {
                    const did = validateQrCode(data);
                    await connectToDid(did);
                }
            } catch (e) {
                if (e instanceof SdkError && e.code === SdkErrors.InvalidQrCode) {
                    debug('Invalid QR Code', JSON.stringify(e, null, 2));
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
                } else {
                    errorStore.setError({ error: e, expected: false });
                }
            } finally {
                onClose();
            }
        }
    }

    const validateCryptoAddress = (input) => {
        const parts = input.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid format. Use "type:address".');
        }
        const [type, address] = parts;
        return address;
    };

    async function connectToDid(did: string) {
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
                throw e;
            }
        }
    }

    const onClose = () => {
        props.onClose();
    };

    return (
        <RBSheet
            ref={props.refMessage}
            openDuration={150}
            closeDuration={100}
            height={700}
            customStyles={{ container: { borderTopStartRadius: 8, borderTopEndRadius: 8 } }}
        >
            <View style={styles.rawTransactionDrawer}>
                <Text style={styles.drawerHead}>Scan QR code</Text>
                <TouchableOpacity onPress={props.onClose}>
                    <TIconButton icon={'close'} color={theme.colors.lightBg} iconColor={theme.colors.grey1} />
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                <QRScanContainer onScan={onScan} onClose={onClose} />
            </View>
        </RBSheet>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingBottom: 50,
    },
    rawTransactionDrawer: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    drawerHead: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 8,
    },
});

export default QRScan;

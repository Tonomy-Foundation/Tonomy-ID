import QrCodeScanContainer from '../containers/QrCodeScanContainer';
import { BarCodeScannerResult } from 'expo-barcode-scanner';
import { CommunicationError, IdentifyMessage, SdkError, SdkErrors, validateQrCode } from '@tonomy/tonomy-id-sdk';
import useUserStore from '../store/userStore';
import useWalletStore from '../store/useWalletStore';
import settings from '../settings';
import Debug from 'debug';
import useErrorStore from '../store/errorStore';
import { ScanQRScreenProps } from '../screens/ScanQRScreen';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Images } from '../assets';
import QRScanContainer from './QRScanContainer';
const debug = Debug('tonomy-id:containers:MainContainer');

export type ScanQRContainerProps = {
    navigation: ScanQRScreenProps['navigation'];
};

export default function ScanQRContainer(props: ScanQRContainerProps) {
    const userStore = useUserStore();
    const user = userStore.user;
    const errorStore = useErrorStore();

    const { web3wallet, ethereumAccount, initialized, sepoliaAccount, polygonAccount, initializeWalletState } =
        useWalletStore();

    async function onScan({ data }: BarCodeScannerResult) {
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

    function onClose() {
        props.navigation.navigate('Assets', {});
    }
    return (
        <View style={styles.content}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.QRContainer}>
                    <QRScanContainer onScan={onScan} onClose={onClose} />
                </View>
                <View style={styles.bottomInstruction}>
                    <Text style={{ fontWeight: '500' }}>QR scanner can be used for:</Text>
                    <View style={styles.flexCol}>
                        <View style={styles.flexRow}>
                            <Image source={Images.GetImage('logo48')} style={styles.favicon} />
                            <Text>Login to Web4 (Pangea) apps</Text>
                        </View>
                        <View style={styles.flexRow}>
                            <Image source={require('../assets/images/crypto-transaction.png')} style={styles.favicon} />
                            <Text>Crypto transactions</Text>
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
    QRContainer: {
        flex: 1,
        borderRadius: 25,
        position: 'relative',
        overflow: 'hidden',
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    bottomInstruction: {
        marginTop: 15,
        padding: 15,
        marginBottom: 20,
    },
    favicon: {
        width: 16,
        height: 16,
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
});

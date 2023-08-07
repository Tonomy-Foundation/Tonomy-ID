import { BarCodeScannerResult } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import { CommunicationError, IdentifyMessage, validateQrCode } from '@tonomy/tonomy-id-sdk';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import { TH2, TP } from '../components/atoms/THeadings';
import useUserStore from '../store/userStore';
import QrCodeScanContainer from './QrCodeScanContainer';
import { SafeAreaView } from 'react-native-safe-area-context';
import useErrorStore from '../store/errorStore';
import { useIsFocused } from '@react-navigation/native';
import TCard from '../components/TCard';
import TSpinner from '../components/atoms/TSpinner';

export default function MainContainer({ did }: { did?: string }) {
    const userStore = useUserStore();
    const user = userStore.user;
    const [username, setUsername] = useState('');
    const [qrOpened, setQrOpened] = useState<boolean>(false);
    const [isLoadingView, setIsLoadingView] = useState(false);
    const errorStore = useErrorStore();

    useEffect(() => {
        setUserName();

        if (did) {
            onUrlOpen(did);
        }
    }, []);

    async function setUserName() {
        try {
            const u = await user.getUsername();

            setUsername(u.getBaseUsername());
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function onUrlOpen(did: string) {
        try {
            await connectToDid(did);
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        } finally {
            onClose();
        }
    }

    async function onScan({ data }: BarCodeScannerResult) {
        try {
            const did = validateQrCode(data);

            await connectToDid(did);
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        } finally {
            onClose();
        }
    }

    async function connectToDid(did: string) {
        try {
            // Connect to the browser using their did:jwk
            const issuer = await user.getIssuer();
            const identifyMessage = await IdentifyMessage.signMessage({}, issuer, did);

            await user.communication.sendMessage(identifyMessage);
        } catch (e) {
            if (e instanceof CommunicationError && e.exception?.status === 404) {
                // Happens if Tonomy Accounts not connected to communication service
                throw new Error('User probably needs to refresh the page. See notes in MainContainer.tsx onScan()');

                // User probably has scanned a QR code on a website that is not logged into Tonomy Communication service
                // Problem is probably in /Tonomy-App-Websites/src/sso/pages/Login.tsx
                // They probably need to refresh the page
                // TODO: tell the user to retry the login by refreshing
            } else {
                throw e;
            }
        }
    }

    function onClose() {
        setQrOpened(false);
    }

    const MainView = () => {
        const isFocused = useIsFocused();

        if (!isFocused) {
            return null;
        }

        return (
            <View style={styles.content}>
                {!qrOpened && (
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <TH2 style={styles.marginTop}>{username}</TH2>
                            <Image
                                source={require('../assets/animations/qr-code.gif')}
                                style={[styles.image, styles.marginTop]}
                            />
                            <TButtonContained
                                style={[styles.button, styles.marginTop]}
                                icon="qrcode-scan"
                                onPress={() => {
                                    setQrOpened(true);
                                }}
                            >
                                Scan QR Code
                            </TButtonContained>
                        </View>

                        <View style={[styles.marginTop, styles.card]}>
                            <TP size={2}>SUGGESTED APPS:</TP>
                            <ScrollView horizontal={true} style={styles.scrollView}>
                                <TCard style={styles.card}>
                                    <TCard.Cover source={require('../assets/images/tonomy-dao.png')} />
                                    <TCard.Badge>Coming Soon</TCard.Badge>
                                    <TCard.Content>
                                        <TP>Tonomy Participate</TP>
                                    </TCard.Content>
                                </TCard>
                                <TCard style={styles.card}>
                                    <TCard.Cover source={require('../assets/images/tonomy-p.png')} />
                                    <TCard.Badge>Coming Soon</TCard.Badge>
                                    <TCard.Content>
                                        <TP>Tonomy DAO</TP>
                                    </TCard.Content>
                                </TCard>
                            </ScrollView>
                        </View>
                    </View>
                )}
                {qrOpened && <QrCodeScanContainer onScan={onScan} onClose={onClose} />}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {isLoadingView ? (
                <View style={styles.requestView}>
                    <Image source={require('../assets/tonomy/connecting.png')}></Image>
                    <TP style={styles.requestText} size={1}>
                        Linking to your web app and receiving data.
                    </TP>
                    <TSpinner style={{ marginBottom: 12 }} />
                    <TButtonOutlined onPress={() => setIsLoadingView(false)}>Cancel</TButtonOutlined>
                </View>
            ) : (
                <MainView />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    requestView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    requestText: {
        paddingHorizontal: 30,
        marginHorizontal: 10,
        paddingVertical: 30,
        marginTop: 10,
        textAlign: 'center',
    },
    image: {
        width: 200,
        height: 190,
        resizeMode: 'contain',
        marginTop: 20,
        marginBottom: 20,
    },
    container: {
        padding: 16,
        flex: 1,
    },
    content: {
        flex: 1,
    },
    header: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 30,
    },
    button: {
        width: '50%',
    },
    marginTop: {
        marginTop: 28,
    },
    cards: {
        flex: 1,
    },
    card: {
        marginRight: 16,
        marginVertical: 16,
    },
    scrollView: {
        marginRight: -20,
    },
});

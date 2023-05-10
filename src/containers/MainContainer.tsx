import { useNavigation } from '@react-navigation/native';
import { BarCodeScannerResult } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import {
    CommunicationError,
    AuthenticationMessage,
    LoginRequestsMessage,
    IdentifyMessage,
    objToBase64Url,
} from '@tonomy/tonomy-id-sdk';
import { TButtonContained, TButtonOutlined } from '../components/atoms/Tbutton';
import { TH2, TP } from '../components/atoms/THeadings';
import useUserStore from '../store/userStore';
import QrCodeScanContainer from './QrCodeScanContainer';
import { MainScreenNavigationProp } from '../screens/MainScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import useErrorStore from '../store/errorStore';
import { useIsFocused } from '@react-navigation/native';
import TCard from '../components/TCard';

export default function MainContainer() {
    const userStore = useUserStore();
    const user = userStore.user;
    const navigation = useNavigation<MainScreenNavigationProp['navigation']>();
    const [username, setUsername] = useState('');
    const [qrOpened, setQrOpened] = useState<boolean>(false);
    const [isLoadingView, setIsLoadingView] = useState(false);
    const errorStore = useErrorStore();

    useEffect(() => {
        async function main() {
            try {
                await loginToService();
                user.communication.subscribeMessage((message) => {
                    const loginRequestsMessage = new LoginRequestsMessage(message);
                    const payload = loginRequestsMessage.getPayload();
                    const base64UrlPayload = objToBase64Url(payload);

                    navigation.navigate('SSO', {
                        payload: base64UrlPayload,
                        platform: 'browser',
                    });
                    setIsLoadingView(false);
                }, LoginRequestsMessage.getType());
            } catch (e) {
                errorStore.setError({ error: e, expected: false });
            }
        }

        main();
        setUserName();
    }, []);

    //TODO: this should be moved to a store or a provider or a hook
    async function loginToService() {
        const issuer = await user.getIssuer();
        const message = await AuthenticationMessage.signMessageWithoutRecipient({}, issuer);

        try {
            await user.communication.login(message);
        } catch (e) {
            if (e instanceof CommunicationError && e.exception.status === 401) {
                await userStore.logout();
            } else {
                throw e;
            }
        }
    }

    async function setUserName() {
        try {
            const u = await user.getUsername();

            setUsername(u.getBaseUsername());
        } catch (e) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function onScan({ data }: BarCodeScannerResult) {
        setIsLoadingView(true);

        try {
            // Connect to the browser using their did:jwk
            const issuer = await user.getIssuer();
            const identifyMessage = await IdentifyMessage.signMessage({}, issuer, data);

            await user.communication.sendMessage(identifyMessage);
        } catch (e) {
            if (e instanceof CommunicationError && e.exception?.status === 404) {
                console.error('User probably needs to refresh the page. See notes in MainContainer.tsx');
                // User probably has scanned a QR code on a website that is not logged into Tonomy Communication
                // They probably need to refresh the page
                // TODO: tell the user to retry the login by refreshing
            } else {
                errorStore.setError({ error: e, expected: false });
            }
        } finally {
            onClose();
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
                                        <TP>Tonomy Participant</TP>
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
                        Linking to your web app and receiving data. Please remain connected
                    </TP>
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

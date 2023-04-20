import { useNavigation } from '@react-navigation/native';
import { BarCodeScannerResult } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import {
    TonomyUsername,
    AccountType,
    CommunicationError,
    AuthenticationMessage,
    LoginRequestsMessage,
    IdentifyMessage,
} from '@tonomy/tonomy-id-sdk';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH2, TP } from '../components/atoms/THeadings';
import useUserStore from '../store/userStore';
import { ApplicationErrors, throwError } from '../utils/errors';
import QrCodeScanContainer from './QrCodeScanContainer';
import { MainScreenNavigationProp } from '../screens/MainScreen';
import settings from '../settings';
import useErrorStore from '../store/errorStore';
import { useIsFocused } from '@react-navigation/native';

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

                    navigation.navigate('SSO', {
                        requests: loginRequestsMessage.getPayload().requests,
                        platform: 'browser',
                    });
                    setIsLoadingView(false);
                }, LoginRequestsMessage.getType());
            } catch (e: any) {
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
        } catch (e: any) {
            if (e instanceof CommunicationError && e.exception.status === 401) {
                await userStore.logout();
            } else {
                throw e;
            }
        }
    }

    async function setUserName() {
        try {
            const u = await user.storage.username;

            if (!u) {
                throwError('Username not found', ApplicationErrors.NoDataFound);
            }

            const baseUsername = TonomyUsername.fromUsername(
                u?.username,
                AccountType.PERSON,
                settings.config.accountSuffix
            ).getBaseUsername();

            setUsername(baseUsername);
        } catch (e: any) {
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
        } catch (e: any) {
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
            <>
                {!qrOpened && (
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <TH2>{username}</TH2>
                            <Image source={require('../assets/animations/qr-code.gif')} style={styles.image} />
                            <TButtonContained
                                style={[styles.button, styles.marginTop]}
                                icon="qrcode-scan"
                                onPress={() => {
                                    setQrOpened(true);
                                }}
                            >
                                Scan Qr Code
                            </TButtonContained>
                        </View>
                    </View>
                )}

                {qrOpened && <QrCodeScanContainer onScan={onScan} onClose={onClose} />}
            </>
        );
    };

    return (
        <View style={styles.container}>
            {isLoadingView ? (
                <View style={styles.requestView}>
                    <Image alt="Tonomy Logo" source={require('../assets/tonomy/connecting.png')}></Image>
                    <TP style={styles.requestText} size={1}>
                        Linking to your web app and receiving data. Please remain connected
                    </TP>
                </View>
            ) : (
                <MainView />
            )}

            {/*
            Cards are in upcoming features 
            <View style={styles.marginTop}>
                <TP size={2}>Upcoming features</TP>
                <ScrollView horizontal={true}>
                    <TCard style={styles.card}>
                        <TCard.Cover source={{ uri: 'https://source.unsplash.com/random/' }} />
                        <TCard.Badge> Coming Soon</TCard.Badge>
                        <TCard.Content>
                            <TP>Credential sharing</TP>
                        </TCard.Content>
                    </TCard>
                    <TCard style={styles.card}>
                        <TCard.Cover source={{ uri: 'https://source.unsplash.com/random?login,SSO' }} />
                        <TCard.Content>
                            <TP>SSO Login</TP>
                        </TCard.Content>
                    </TCard>
                    <TCard style={styles.card}>
                        <TCard.Badge> Coming Soon</TCard.Badge>

                        <TCard.Cover source={{ uri: 'https://source.unsplash.com/random?transactions,crypto' }} />
                        <TCard.Content>
                            <TP>Transaction signing</TP>
                        </TCard.Content>
                    </TCard>
                </ScrollView>
            </View> */}
        </View>
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
        width: 220,
        height: 220,
        resizeMode: 'contain',
    },
    container: {
        padding: 16,
        flex: 1, //remove this when cards are added
        justifyContent: 'center', //remove this when cards are added
    },
    header: {
        alignItems: 'center',
    },
    button: {
        transform: [{ scale: 1.2 }],
    },
    marginTop: {
        marginTop: 32,
    },
    card: {
        width: 250,
        marginVertical: 16,
        marginRight: 16,
    },
});

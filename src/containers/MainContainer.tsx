import { useNavigation } from '@react-navigation/native';
import { BarCodeScannerResult } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import { MessageType, TonomyUsername, AccountType, CommunicationError } from '@tonomy/tonomy-id-sdk';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH2, TP } from '../components/atoms/THeadings';
import useUserStore from '../store/userStore';
import { ApplicationErrors, throwError } from '../utils/errors';
import QrCodeScanContainer from './QrCodeScanContainer';
import { MainScreenNavigationProp } from '../screens/MainScreen';
import settings from '../settings';
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
                    navigation.navigate('SSO', {
                        requests: JSON.stringify(message.getPayload().requests),
                        platform: 'browser',
                    });
                    setIsLoadingView(false);
                }, MessageType.LOGIN_REQUEST);
            } catch (e: any) {
                errorStore.setError({ error: e, expected: false });
            }
        }

        main();
        setUserName();
    }, []);

    //TODO: this should be moved to a store or a provider or a hook
    async function loginToService() {
        const message = await user.signMessage({}, { type: MessageType.COMMUNICATION_LOGIN });

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
            ).getBaseUsername() as string;

            setUsername(baseUsername);
        } catch (e: any) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function onScan({ data }: BarCodeScannerResult) {
        setIsLoadingView(true);

        try {
            /**
             * the data object is what the user scanned
             * right now we only have did
             * when the user scans and get the did of the tonomy sso website
             * the user send an ack message to the sso website.
             * then closes the QR scanner container
             */
            const message = await user.signMessage({}, { recipient: data, type: MessageType.IDENTIFY });

            await user.communication.sendMessage(message);
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
                                Scan Qr Code
                            </TButtonContained>
                        </View>

                        <View style={[styles.marginTop, styles.card]}>
                            <TP size={2}>SUGGESTED APPS:</TP>
                            <ScrollView horizontal={true}>
                                <TCard style={styles.card}>
                                    <TCard.Cover
                                        source={{ uri: 'https://source.unsplash.com/random?particpiant,civil' }}
                                    />
                                    <TCard.Badge>Coming Soon</TCard.Badge>
                                    <TCard.Content>
                                        <TP>Tonomy Participant</TP>
                                    </TCard.Content>
                                </TCard>
                                <TCard style={styles.card}>
                                    <TCard.Cover source={{ uri: 'https://source.unsplash.com/random?DAO' }} />
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
        // // flexGrow: 1,
        flexDirection: 'column',
        // flexWrap: 'nowrap',
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
});

import { useNavigation } from '@react-navigation/native';
import { BarCodeScannerResult } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { MessageType, TonomyUsername, AccountType, CommunicationError } from '@tonomy/tonomy-id-sdk';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH2 } from '../components/atoms/THeadings';
import useUserStore from '../store/userStore';
import { ApplicationErrors, throwError } from '../utils/errors';
import QrCodeScanContainer from './QrCodeScanContainer';
import { MainScreenNavigationProp } from '../screens/MainScreen';
import settings from '../settings';
import useErrorStore from '../store/errorStore';

export default function MainContainer() {
    const userStore = useUserStore();
    const user = userStore.user;
    const navigation = useNavigation<MainScreenNavigationProp['navigation']>();
    const [username, setUsername] = useState('');
    const [qrOpened, setQrOpened] = useState<boolean>(false);
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
            ).getBaseUsername();

            setUsername(baseUsername);
        } catch (e: any) {
            errorStore.setError({ error: e, expected: false });
        }
    }

    async function onScan({ data }: BarCodeScannerResult) {
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

    return (
        <View style={styles.container}>
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

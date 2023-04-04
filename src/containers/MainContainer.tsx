import { useNavigation } from '@react-navigation/native';
import { BarCodeScannerResult } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Image, BackHandler } from 'react-native';
import { DrawerItemProps } from 'react-native-paper';
import { Message, TonomyUsername, AccountType } from '@tonomy/tonomy-id-sdk';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH2, TP } from '../components/atoms/THeadings';
import TCard from '../components/TCard';
import useUserStore from '../store/userStore';
import { ApplicationErrors, throwError } from '../utils/errors';
import QrCodeScanContainer from './QrCodeScanContainer';
import { MainScreenNavigationProp } from '../screens/MainScreen';
import settings from '../settings';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MainContainer() {
    const user = useUserStore((state) => state.user);
    const navigation = useNavigation<MainScreenNavigationProp['navigation']>();
    const [username, setUsername] = useState('');
    const [qrOpened, setQrOpened] = useState<boolean>(false);

    useEffect(() => {
        async function main() {
            await loginToService();
            user.communication.subscribeMessage((m) => {
                console.log('REcieved from sso');

                const message = new Message(m);

                console.log(message.getPayload());

                navigation.navigate('SSO', {
                    requests: JSON.stringify(message.getPayload().requests),
                    platform: 'browser',
                });
            });
        }

        main();
        setUserName();
    }, []);

    //TODO: this should be moved to a store or a provider or a hook
    async function loginToService() {
        const message = await user.signMessage({});

        await user.communication.login(message);
    }

    async function setUserName() {
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
    }

    async function onScan({ data }: BarCodeScannerResult) {
        //TODO: change to typed messages

        /**
         * the data object is what the user scanned
         * right now we only have did
         * when the user scans and get the did of the tonomy sso website
         * the user send an ack message to the sso website.
         * then closes the QR scanner container
         */
        const message = await user.signMessage({ type: 'ack' }, data);

        await user.communication.sendMessage(message);
        onClose();
    }

    function onClose() {
        setQrOpened(false);
    }

    return (
        <SafeAreaView style={styles.container}>
            {!qrOpened && (
                <View style={styles.content}>
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

                    <View style={[styles.marginTop, styles.card]}>
                        <TP size={2}>SUGGESTED APPS:</TP>
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

                                <TCard.Cover
                                    source={{ uri: 'https://source.unsplash.com/random?transactions,crypto' }}
                                />
                                <TCard.Content>
                                    <TP>Transaction signing</TP>
                                </TCard.Content>
                            </TCard>
                        </ScrollView>
                    </View>
                </View>
            )}

            {qrOpened && <QrCodeScanContainer onScan={onScan} onClose={onClose} />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
        // justifyContent: 'center',
        flex: 1,
        // // flexGrow: 1,
        flexDirection: 'column',
        // flexWrap: 'nowrap',
        alignItems: 'center',
    },
    button: {
        transform: [{ scale: 1.2 }],
    },
    marginTop: {
        marginTop: 32,
    },
    cards: {
        flex: 1,
    },
    card: {
        marginRight: 16,
        marginVertical: 16,
    },
});

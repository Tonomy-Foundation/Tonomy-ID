import { useNavigation } from '@react-navigation/native';
import { BarCodeScannerResult } from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { DrawerItemProps } from 'react-native-paper';
import { Message, TonomyUsername, User } from '@tonomy/tonomy-id-sdk';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH2, TP } from '../components/atoms/THeadings';
import TCard from '../components/TCard';
import useUserStore from '../store/userStore';
import { ApplicationErrors, throwError } from '../utils/errors';
import QrCodeScanContainer from './QrCodeScanContainer';
import { MainScreenNavigationProp } from '../screens/MainScreen';

export default function MainContainer() {
    const user = useUserStore((state) => state.user);
    const navigation = useNavigation<MainScreenNavigationProp['navigation']>();
    const [username, setUsername] = useState<TonomyUsername>();
    const [qrOpened, setQrOpened] = useState<boolean>(false);

    useEffect(() => {
        loginToService();
        setUserName();
        user.communication.subscribeMessage((m) => {
            console.log('REcieved from sso');

            const message = new Message(m);

            console.log(message.getPayload());

            navigation.navigate('SSO', {
                requests: JSON.stringify(message.getPayload().requests),
                platform: 'browser',
            });
        });
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

        setUsername(u);
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
        <View style={styles.container}>
            {!qrOpened && (
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TH2>{username?.username}</TH2>
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

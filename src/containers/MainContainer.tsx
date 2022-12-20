import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TonomyUsername } from 'tonomy-id-sdk';
import QrIcon from '../assets/icons/QrIcon';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH2 } from '../components/atoms/THeadings';
import useUserStore from '../store/userStore';
import { ApplicationErrors, throwError } from '../utils/errors';
import { QrCodeScanScreenProps } from '../screens/QrCodeScanScreen';

export default function MainContainer() {
    const user = useUserStore((state) => state.user);
    const [username, setUsername] = useState<TonomyUsername>({});
    useEffect(() => {
        setUserName();
    }, []);

    const navigation = useNavigation<QrCodeScanScreenProps['navigation']>();

    async function setUserName() {
        const u = await user.storage.username;
        if (!u) {
            throwError('Username not found', ApplicationErrors.NoDataFound);
        }
        setUsername(u);
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TH2>{username.username}</TH2>
                <QrIcon height="200" width="100%" style={styles.marginTop} />
                <TButtonContained
                    style={[styles.button, styles.marginTop]}
                    onPress={() => navigation.navigate('QrScanner')}
                    icon="qrcode-scan"
                >
                    Scan Qr Code
                </TButtonContained>
            </View>
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

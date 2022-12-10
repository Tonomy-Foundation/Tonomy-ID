import React from 'react';
import { ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import Qricon from '../assets/icons/Qricon';
import { TButtonContained } from '../components/atoms/Tbutton';
import { TH2, TP } from '../components/atoms/THeadings';
import TCard from '../components/TCard';
import useUserStore from '../store/userStore';

export default function MainContainer() {
    const user = useUserStore((state) => state.user);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TH2>{user.storage.username.username || 'username'}</TH2>
                <Qricon height="200" width="100%" style={styles.marginTop} />
                <TButtonContained style={[styles.button, styles.marginTop]} icon="qrcode-scan">
                    {' '}
                    Scan Qr Code
                </TButtonContained>
            </View>
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
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
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

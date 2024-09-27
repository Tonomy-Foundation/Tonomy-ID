import { Props } from '../screens/Citizenship';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../utils/theme';
import useUserStore from '../store/userStore';
export default function CitizenshipContainer({ navigation }: { navigation: Props['navigation'] }) {
    const userStore = useUserStore();
    const user = userStore.user;

    const [username, setUsername] = useState<string>('');
    useEffect(() => {
        const fetchUsername = async () => {
            const u = await user.getUsername();
            setUsername(u.getBaseUsername());
        };
        if (user) {
            fetchUsername();
        }
    }, [user]);
    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContent}>
                <Text style={styles.title}>Welcome to Pangea Virtual Nation, @{username}</Text>
                <View style={styles.identityView}>
                    <View style={styles.identityTitle}>
                        <Text style={styles.identityText}>Your identity, your control</Text>
                        <Text style={styles.identityNotes}>
                            Pangea does not own or control your citizenship like other state nations
                        </Text>
                    </View>
                    <View style={styles.identityImage}>
                        <Image source={require('../assets/images/citizenship-banner.png')} />
                    </View>
                </View>
                <Text style={styles.subTitle}>Pangea is your ticket to digital worlds available now</Text>
                <View style={styles.digitalWorldContent}>
                    <TouchableOpacity>
                        <View style={styles.webImage}>
                            <Image source={require('../assets/images/login-webapps.png')} />
                        </View>
                        <Text style={styles.webTitle}>Login to Web4 Apps</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <View style={styles.webImage}>
                            <Image source={require('../assets/images/manage-crypto.png')} />
                        </View>
                        <Text style={styles.webTitle}>Manage your Crypto</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.subTitle}>Worlds coming soon</Text>
                <ScrollView horizontal={true} style={{ paddingBottom: 70 }}>
                    <View style={styles.horizontalScrollMain}>
                        <View style={styles.horizontalScroll}>
                            <View style={styles.horizontalScrollContent}>
                                <Text style={styles.horizontalScrollText}>Pay globally without middlemen</Text>
                                <Text style={styles.horizontalScrollNotes}>with Pangea Banklesss</Text>
                            </View>
                            <View>
                                <Image source={require('../assets/images/coming-soon-user-placeholder.png')} />
                            </View>
                        </View>
                    </View>
                    <View style={styles.horizontalScrollMain}>
                        <View style={styles.horizontalScroll}>
                            <View style={styles.horizontalScrollContent}>
                                <Text style={styles.horizontalScrollText}>Unlock the Power of Decentralization</Text>
                                <Text style={styles.horizontalScrollNotes}>with Pangea DAO</Text>
                            </View>
                            <View>
                                <Image source={require('../assets/images/coming-soon-user-placeholder.png')} />
                            </View>
                        </View>
                    </View>
                    <View style={styles.horizontalScrollMain}>
                        <View style={styles.horizontalScroll}>
                            <View style={styles.horizontalScrollContent}>
                                <Text style={styles.horizontalScrollText}>Be a part of Liquid Democracy</Text>
                                <Text style={styles.horizontalScrollNotes}>with Pangea Gov+</Text>
                            </View>
                            <View>
                                <Image source={require('../assets/images/coming-soon-user-placeholder.png')} />
                            </View>
                        </View>
                    </View>
                    <View style={styles.horizontalScrollMain}>
                        <View style={styles.horizontalScroll}>
                            <View style={styles.horizontalScrollContent}>
                                <Text style={styles.horizontalScrollText}>Build Next-generation apps</Text>
                                <Text style={styles.horizontalScrollNotes}>with Pangea Build</Text>
                            </View>
                            <View>
                                <Image source={require('../assets/images/coming-soon-user-placeholder.png')} />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    title: {
        fontSize: 26,
        fontFamily: 'Inter',
        fontWeight: '700',
        lineHeight: 33.89,
        paddingBottom: 18,
    },
    identityTitle: {
        flexDirection: 'column',
        gap: 4,
    },
    identityView: {
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 20,
        flexDirection: 'column',
        gap: 14,
    },
    identityText: {
        fontWeight: '600',
        fontFamily: 'Inter',
        fontSize: 17,
        lineHeight: 20.57,
    },
    identityNotes: {
        fontWeight: '400',
        fontSize: 16,
        lineHeight: 18.75,
        fontFamily: 'Roboto',
        flexDirection: 'column',
    },
    identityImage: {
        alignItems: 'center',
    },
    subTitle: {
        marginTop: 30,
        marginBottom: 10,
        fontFamily: 'Inter',
        fontWeight: '700',
        fontSize: 20,
        lineHeight: 24.2,
    },
    digitalWorldContent: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    webImage: {
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 10,
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    webTitle: {
        width: 163.5,
        fontFamily: 'Roboto',
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 21,
        textAlign: 'center',
        paddingTop: 8,
        paddingHorizontal: 20,
    },
    horizontalScroll: {
        flexDirection: 'row',
        padding: 16,
        marginTop: 8,
        width: 326,
        height: 150,
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 10,
    },
    horizontalScrollMain: {
        paddingEnd: 18,
    },
    horizontalScrollContent: {
        alignSelf: 'center',
    },
    horizontalScrollText: {
        width: 185,
        fontFamily: 'Inter',
        fontSize: 17,
        fontWeight: '700',
        lineHeight: 20.57,
        letterSpacing: 0.15,
        textAlign: 'left',
    },
    horizontalScrollNotes: {
        width: 185,
        fontFamily: 'Roboto',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 16.41,
        letterSpacing: 0.16,
        borderColor: theme.colors.grey9,
    },
});

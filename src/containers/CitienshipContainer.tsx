import React, { useEffect, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme, { commonStyles } from '../utils/theme';
import useUserStore from '../store/userStore';
import { Props } from '../screens/CitizenshipScreen';
import settings from '../settings';
import TButton from '../components/TIconButton';

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

    const HorizontalScrollItem = ({
        title,
        subtitle,
        imageSource,
        url,
    }: {
        title: string;
        subtitle: string;
        imageSource: any;
        url: string;
    }) => {
        return (
            <TouchableOpacity style={styles.horizontalScrollMain} onPress={() => Linking.openURL(url)}>
                <View style={styles.horizontalScroll}>
                    <View style={styles.horizontalScrollContent}>
                        <Text style={styles.horizontalScrollText}>{title}</Text>
                        <Text style={styles.horizontalScrollNotes}>{subtitle}</Text>
                    </View>
                    <View>
                        <Image style={{ width: 120, height: 120 }} source={imageSource} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContent}>
                <Text style={styles.title}>
                    Welcome to {settings.config.ecosystemName}, @{username}
                </Text>
                <View style={styles.identityView}>
                    <View style={styles.identityTitle}>
                        <Text style={styles.identityText}>Your identity, your control</Text>
                        <Text style={styles.identityNotes}>
                            {settings.config.ecosystemName} does not own or control your citizenship like other state
                            nations
                        </Text>
                    </View>
                    <View style={styles.identityImage}>
                        <Image
                            style={styles.image}
                            source={require('../assets/images/citizenship/citizenship-identity-image.png')}
                        />
                    </View>
                </View>
                <Text style={styles.subTitle}>
                    {settings.config.ecosystemName} is your ticket to digital worlds available now
                </Text>
                <View style={styles.digitalWorldContent}>
                    <TouchableOpacity style={styles.webMain} onPress={() => navigation.navigate('Apps')}>
                        <View style={styles.webImage}>
                            <Image
                                style={{ height: 120, width: 120 }}
                                source={require('../assets/images/citizenship/login-webapps.png')}
                            />
                        </View>
                        <View>
                            <Text style={styles.webTitle}>Login to Web4 Apps</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.webMain} onPress={() => navigation.navigate('Assets')}>
                        <View style={styles.webImage}>
                            <Image
                                style={{ height: 120, width: 120 }}
                                source={require('../assets/images/citizenship/manage-crypto.png')}
                            />
                        </View>
                        <View>
                            <Text style={styles.webTitle}>Manage your Crypto</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                {/* <Text style={styles.subTitle}>Worlds coming soon</Text> */}
                {/* <ScrollView horizontal={true} style={{ paddingBottom: 70 }}>
                    <HorizontalScrollItem
                        title="Pay globally without middlemen"
                        subtitle={`with ${settings.config.ecosystemName} Banklesss`}
                        imageSource={require('../assets/images/citizenship/1-slide.png')}
                        url="https://tonomy.io/technology/pangea-bankless"
                    />
                    <HorizontalScrollItem
                        title="Unlock the Power of Decentralization"
                        subtitle={`with ${settings.config.ecosystemName} DAO on Hypha`}
                        imageSource={require('../assets/images/citizenship/2-slide.png')}
                        url="https://tonomy.io/technology/pangea-dao"
                    />
                    <HorizontalScrollItem
                        title="Be a part of Liquid Democracy"
                        subtitle={`with ${settings.config.ecosystemName} Gov+`}
                        imageSource={require('../assets/images/citizenship/3-slide.png')}
                        url="https://tonomy.io/technology/pangea-gov"
                    />
                    <HorizontalScrollItem
                        title="Build Next- generation apps"
                        subtitle={`with ${settings.config.ecosystemName} Build`}
                        imageSource={require('../assets/images/citizenship/4-slide.png')}
                        url="https://tonomy.io/technology/pangea-build"
                    />
                </ScrollView> */}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    image: {
        width: '100%',
        height: 309,
        resizeMode: 'cover',
    },
    scrollContent: {
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        paddingBottom: 18,
        ...commonStyles.primaryFontFamily,
    },
    identityTitle: {
        flexDirection: 'column',
        gap: 4,
    },
    identityView: {
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 18,
        flexDirection: 'column',
        gap: 12,
    },
    identityText: {
        fontWeight: '600',
        fontSize: 17,
        ...commonStyles.primaryFontFamily,
    },
    identityNotes: {
        fontWeight: '400',
        fontSize: 16,
        lineHeight: 18.75,
        ...commonStyles.secondaryFontFamily,
        flexDirection: 'column',
    },
    identityImage: {
        alignItems: 'center',
    },
    subTitle: {
        marginTop: 20,
        marginBottom: 5,
        fontWeight: '700',
        fontSize: 20,
        ...commonStyles.primaryFontFamily,
    },
    digitalWorldContent: {
        flexDirection: 'row',
        gap: 14,
        marginTop: 5,
        marginBottom: 50,
    },
    webMain: {
        flexGrow: 1,
        flexBasis: 0,
    },
    webImage: {
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 10,
        paddingHorizontal: 18,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    webTitle: {
        fontSize: 16,
        fontWeight: '500',
        paddingTop: 8,
        alignSelf: 'center',
    },
    horizontalScroll: {
        flexDirection: 'row',
        padding: 16,
        marginTop: 8,
        width: 300,
        height: 149,
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 10,
    },
    horizontalScrollMain: {
        paddingEnd: 12,
    },
    horizontalScrollContent: {
        alignSelf: 'center',
    },
    horizontalScrollText: {
        width: 165,
        fontSize: 17,
        fontWeight: '700',
        lineHeight: 18.57,
        height: 42,
        textAlign: 'left',
        ...commonStyles.primaryFontFamily,
    },
    horizontalScrollNotes: {
        width: 160,
        fontSize: 13,
        fontWeight: '400',
        borderColor: theme.colors.grey9,
        ...commonStyles.secondaryFontFamily,
    },
});

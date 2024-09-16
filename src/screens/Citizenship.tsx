import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import theme from '../utils/theme';
import useUserStore from '../store/userStore';

export default function Citizenship() {
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
                <Text style={styles.digitalWorldsTitle}>Pangea is your ticket to digital worlds available now</Text>
                <View style={{flexDirection:'row',gap:16 ,marginTop:8}}>
                    <View >
                        <View style={styles.webImage}>
                        <Image source={require('../assets/images/LoginWebApps.png')} />   
                        </View>
                        <Text style={styles.webTitle}>Login to Web4 Apps</Text>
                    </View>
                    <View>
                        <View style={styles.webImage}>
                            <Image source={require('../assets/images/ManageCrypto.png')}/>
                        </View>
                        <Text style={styles.webTitle}>Manage your Crypto</Text>
                    </View>
                </View>
                <Text style={styles.digitalWorldsTitle}>Worlds coming soon</Text>
                <ScrollView horizontal={true} style={{paddingBottom:60}}> 
                    <View style={styles.horizontalScrollMain}>
                        <View style={styles.horizontalScroll}>
                            <View style={styles.horizontalScrollContent}>
                                <Text style={styles.horizontalScrollText}>Pay globally without middlemen</Text>
                                <Text style={styles.horizontalScrollNotes}>with Pangea Banklesss</Text>
                            </View>
                            <View>
                                <Image source={require('../assets/images/middlemen.png')}/>
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
                                <Image source={require('../assets/images/middlemen.png')}/>
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
                                <Image source={require('../assets/images/middlemen.png')}/>
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
                                <Image source={require('../assets/images/middlemen.png')}/>
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
        paddingTop:18
    },
    scrollContent: {
        padding: 16,
        
    },
    title: {
        fontSize: 28,
        fontFamily: 'Inter',
        fontWeight: '700',
        lineHeight: 33.89,
        paddingBottom: 18
    },
    identityTitle: {
        flexDirection: 'column',
        gap: 4 
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
    digitalWorldsTitle: {
        paddingTop: 18,
        fontFamily: 'Inter',
        fontWeight: '700',
        fontSize: 20,
        lineHeight:24.2
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
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight:'400',
        lineHeight: 21,
        textAlign:'center',
        paddingTop:8,
    },
    horizontalScroll: {
        flexDirection: 'row',
        padding:16,
        marginTop: 8,
        width: 326, height: 150,
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        borderRadius: 10,
    },
    horizontalScrollMain: {
        paddingEnd:17
    },
    horizontalScrollContent: {
        alignSelf: 'center'
    },
    horizontalScrollText: {
        width: 185, 
        fontFamily: "Inter",
        fontSize: 17,
        fontWeight: "700",
        lineHeight: 20.57,
        letterSpacing: 0.15,
        textAlign: 'left',
    },
    horizontalScrollNotes: {
        width: 185, 
        fontFamily: "Roboto",
        fontSize: 14,
        fontWeight: "400",
        lineHeight: 16.41,
        letterSpacing: 0.16,
        borderColor: theme.colors.grey9,
    }
});

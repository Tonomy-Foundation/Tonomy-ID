import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Props } from '../screens/SupportScreen';
import theme from '../utils/theme';
import TelegramIcon from '../assets/icons/TelegramIcon';
import DiscordIcon from '../assets/icons/DiscordIcon';
import * as Linking from 'expo-linking';
import settings from '../settings';

export default function SupportContainer({ navigation }: { navigation: Props['navigation'] }) {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.supportNotesContainer}>
                <Text style={styles.supportNote}>
                    If you encounter any problems, then feel free to contact us for the fastest solution to your problem
                </Text>
            </View>
            <View style={styles.supportUsersContainer}>
                <View style={styles.supportUser}>
                    <Image source={require('../assets/images/jack-tanner.png')} style={styles.supportUserAvatar} />
                    <View style={styles.supportUserDetails}>
                        <View>
                            <Text style={styles.supportUsername}>Jack Tanner</Text>
                            <Text style={styles.supportUserRole}>Chief Technology Officer</Text>
                        </View>
                        <TouchableOpacity onPress={() => Linking.openURL('tel:+31 6 2216 5433')}>
                            <Text style={styles.supportUserContactNumber}>+31 6 2216 5433</Text>
                        </TouchableOpacity>
                        <View style={styles.supportUserSocialButtons}>
                            <TouchableOpacity
                                onPress={() => Linking.openURL('https://t.me/theblockstalk')}
                                style={[styles.button, styles.telegram]}
                            >
                                <TelegramIcon color={theme.colors.white} />
                                <Text style={styles.buttonText}>Telegram</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => Linking.openURL('https://discordapp.com/users/574914463141068820')}
                                style={[styles.button, styles.discord]}
                            >
                                <DiscordIcon color={theme.colors.white} />
                                <Text style={styles.buttonText}>Discord</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.supportUser}>
                    <Image source={require('../assets/images/phil-patterson.jpeg')} style={styles.supportUserAvatar} />
                    <View style={styles.supportUserDetails}>
                        <View>
                            <Text style={styles.supportUsername}>Philip Patterson</Text>
                            <Text style={styles.supportUserRole}>{settings.config.ecosystemName} Fundraising Lead</Text>
                        </View>
                        <TouchableOpacity onPress={() => Linking.openURL('tel:+44 7 8286 99027')}>
                            <Text style={styles.supportUserContactNumber}>+44 7 8286 99027</Text>
                        </TouchableOpacity>
                        <View style={styles.supportUserSocialButtons}>
                            <TouchableOpacity
                                onPress={() => Linking.openURL('https://t.me/philjames8')}
                                style={[styles.button, styles.telegram]}
                            >
                                <TelegramIcon color={theme.colors.white} />
                                <Text style={styles.buttonText}>Telegram</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => Linking.openURL('https://discordapp.com/users/1009886278898159626')}
                                style={[styles.button, styles.discord]}
                            >
                                <DiscordIcon color={theme.colors.white} />
                                <Text style={styles.buttonText}>Discord</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    supportNotesContainer: {
        backgroundColor: theme.colors.grey7,
        padding: 16,
        borderRadius: 8,
    },
    supportNote: {
        fontSize: 16,
        color: theme.colors.black,
    },
    button: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        gap: 4,
    },
    telegram: {
        backgroundColor: '#29A9EA',
    },
    discord: {
        backgroundColor: '#5865F2',
    },
    buttonText: {
        color: theme.colors.white,
        fontSize: 13,
    },
    supportUsersContainer: {
        flexDirection: 'column',
        gap: 30,
        marginTop: 25,
    },
    supportUser: {
        flexDirection: 'row',
        gap: 10,
    },
    supportUserAvatar: {
        width: 44,
        height: 44,
        borderRadius: 30,
    },
    supportUserDetails: {
        flexDirection: 'column',
        gap: 8,
    },
    supportUsername: {
        fontSize: 16,
        fontWeight: '500',
    },
    supportUserRole: {
        fontSize: 14,
        color: theme.colors.grey9,
    },
    supportUserContactNumber: {
        color: theme.colors.blue,
        fontSize: 18,
        fontWeight: '500',
    },
    supportUserSocialButtons: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 5,
    },
});

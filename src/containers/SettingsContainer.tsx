import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Props } from '../screens/SettingsScreen';
import useUserStore from '../store/userStore';
import TModal from '../components/TModal';
import theme from '../utils/theme';
import { TButtonText } from '../components/atoms/TButton';
import { appStorage, keyStorage } from '../utils/StorageManager/setup';
import { Switch } from 'react-native-paper';
import { BinMinusIn, Code, LogOut, NavArrowRight } from 'iconoir-react-native';

export default function SettingsContainer({ navigation }: { navigation: Props['navigation'] }) {
    const { logout } = useUserStore();
    const [showModal, setShowModal] = useState(false);

    async function onModalPress() {
        setShowModal(false);
    }

    const [developerMode, setDeveloperMode] = React.useState(true);

    const onToggleSwitch = async () => {
        setDeveloperMode(!developerMode);
        await appStorage.setDeveloperMode(!developerMode);
    };

    useEffect(() => {
        const fetchSettings = async () => {
            const developerMode = await appStorage.getDeveloperMode();

            setDeveloperMode(developerMode);
        };

        fetchSettings();
    }, []);

    return (
        <ScrollView style={styles.container}>
            <View>
                <Text style={{ color: theme.colors.grey9 }}>Tools</Text>
                <View style={styles.mainMenu}>
                    <TouchableOpacity
                        style={styles.menuItemContainer}
                        onPress={async () => {
                            await logout('Logout in settings menu');

                            if (keyStorage && appStorage) {
                                await keyStorage.deleteAll();
                                await appStorage.deleteAll();
                            }
                        }}
                    >
                        <View style={styles.menuItem}>
                            <View style={styles.menuItemIconContainer}>
                                <Code height={20} width={20} color={theme.colors.grey9} style={styles.menuItemIcon} />
                            </View>
                            <View>
                                <Text style={styles.menuItemText}>Developer mode</Text>
                                <Text style={styles.menuItemTextHelp}>
                                    Use testnet coins and receive debug messages
                                </Text>
                            </View>
                        </View>
                        <Switch
                            style={{ flexShrink: 0 }}
                            value={developerMode}
                            onValueChange={onToggleSwitch}
                            color={theme.colors.success}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ marginTop: 50 }}>
                <Text style={{ color: theme.colors.grey9 }}>Account</Text>
                <View style={styles.mainMenu}>
                    <TouchableOpacity
                        style={styles.menuItemContainer}
                        onPress={async () => {
                            await logout('Logout in settings menu');

                            if (keyStorage && appStorage) {
                                await keyStorage.deleteAll();
                                await appStorage.deleteAll();
                            }
                        }}
                    >
                        <View style={styles.menuItem}>
                            <View style={styles.menuItemIconContainer}>
                                <LogOut height={20} width={20} color={theme.colors.grey9} style={styles.menuItemIcon} />
                            </View>
                            <View>
                                <Text style={styles.menuItemText}>Logout</Text>
                            </View>
                        </View>
                        <NavArrowRight width={25} height={30} color={theme.colors.grey9} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItemContainer} onPress={() => setShowModal(true)}>
                        <View style={styles.menuItem}>
                            <View style={styles.menuItemIconContainer}>
                                <BinMinusIn
                                    height={20}
                                    width={20}
                                    color={theme.colors.grey9}
                                    style={styles.menuItemIcon}
                                />
                            </View>
                            <View>
                                <Text style={styles.menuItemText}>Delete account</Text>
                            </View>
                        </View>
                        <NavArrowRight width={25} height={30} color={theme.colors.grey9} />
                    </TouchableOpacity>
                </View>
            </View>
            <TModal
                visible={showModal}
                onPress={onModalPress}
                title={''}
                footer={
                    <View style={styles.footerButtonRow}>
                        <View>
                            <TButtonText onPress={() => setShowModal(false)}>
                                <Text style={{ color: theme.colors.grey1 }}>Cancel</Text>
                            </TButtonText>
                        </View>
                        <View>
                            <TButtonText
                                onPress={async () => {
                                    await logout('Logout in settings menu');
                                }}
                            >
                                <Text style={{ color: theme.colors.error }}>Delete</Text>
                            </TButtonText>
                        </View>
                    </View>
                }
            >
                <View>
                    <Text style={styles.deleteHeading}>Are you sure you would like to delete this wallet?</Text>
                </View>
                <View>
                    <Text style={styles.deleteText}>Make sure you remember your 6 word passphrase.</Text>
                </View>
            </TModal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    footerButtonRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 90,
    },
    deleteHeading: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    deleteText: {
        textAlign: 'center',
        marginHorizontal: 11,
        fontSize: 14,
    },
    mainMenu: {
        marginTop: 15,
        flexDirection: 'column',
        gap: 10,
    },
    menuItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexShrink: 1,
    },
    menuItemIconContainer: {
        borderWidth: 1,
        borderColor: theme.colors.grey8,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        flexShrink: 0,
    },
    menuItemIcon: {
        width: 20,
        height: 20,
    },
    menuItemText: {
        color: theme.colors.black,
        fontSize: 16,
    },
    menuItemTextHelp: {
        color: theme.colors.grey9,
        fontSize: 12,
    },
});

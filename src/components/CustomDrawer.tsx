import React, { useEffect, useState } from 'react';

import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useUserStore from '../store/userStore';
import { useAppTheme } from '../utils/theme';

import { HeadsetHelp, HomeSimple, LogOut, NavArrowRight, ProfileCircle, Settings } from 'iconoir-react-native';

export default function CustomDrawer(props: DrawerContentComponentProps) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const userStore = useUserStore();
    const user = userStore.user;

    const [username, setUsername] = useState<string>('');
    const [greeting, setGreeting] = useState<string>('Good morning');

    useEffect(() => {
        const currentHour = new Date().getHours(); // Get current hour from device time

        if (currentHour < 12) {
            setGreeting('Good morning');
        } else if (currentHour >= 12 && currentHour < 18) {
            setGreeting('Good afternoon');
        } else {
            setGreeting('Good evening');
        }
    }, []);

    useEffect(() => {
        const fetchUsername = async () => {
            const u = await user.getUsername();

            setUsername(u.getBaseUsername());
        };

        if (user) {
            fetchUsername();
        }
    }, [user]);

    const theme = useAppTheme();
    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
        },
        drawerContentScrollView: {
            justifyContent: 'space-between',
            flex: 1,
        },
        drawerHeader: {
            paddingHorizontal: 16,
            paddingVertical: 20,
            borderBottomWidth: 1,
            borderColor: theme.colors.grey8,
        },
        drawerHeaderGreetings: {
            color: theme.colors.grey9,
            fontSize: 12,
        },
        drawerHeaderUsername: {
            fontSize: 20,
            fontWeight: '500',
            color: theme.colors.black,
        },
        mainMenu: {
            padding: 16,
            flexDirection: 'column',
            gap: 10,
        },
        menuItemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        menuItemIconContainer: {
            borderWidth: 1,
            borderColor: theme.colors.grey8,
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 30,
        },
        menuItemIcon: {
            width: 20,
            height: 20,
        },
        menuItemText: {
            color: theme.colors.black,
            fontSize: 16,
        },
        drawerFooter: {
            paddingHorizontal: 16,
            paddingVertical: 20,
            flexDirection: 'column',
            gap: 10,
            borderTopWidth: 1,
            borderColor: theme.colors.grey8,
            marginBottom: 30,
        },
    });

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView
                {...props}
                style={styles.container}
                contentContainerStyle={styles.drawerContentScrollView}
            >
                <View>
                    <View style={styles.drawerHeader}>
                        <View style={styles.menuItem}>
                            <View style={styles.menuItemIconContainer}>
                                <ProfileCircle
                                    height={20}
                                    width={20}
                                    color={theme.colors.grey9}
                                    style={styles.menuItemIcon}
                                />
                            </View>
                            <View>
                                <Text style={styles.drawerHeaderGreetings}>{greeting},</Text>
                                <Text style={styles.drawerHeaderUsername}>@{username}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.mainMenu}>
                        <TouchableOpacity
                            style={styles.menuItemContainer}
                            onPress={() => props.navigation.navigate('Citizenship')}
                        >
                            <View style={styles.menuItem}>
                                <View style={styles.menuItemIconContainer}>
                                    <HomeSimple
                                        height={20}
                                        width={20}
                                        color={theme.colors.grey9}
                                        style={styles.menuItemIcon}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.menuItemText}>Home</Text>
                                </View>
                            </View>
                            <NavArrowRight width={25} height={30} color={theme.colors.grey9} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuItemContainer}
                            onPress={() => props.navigation.getParent()?.navigate('Settings')}
                        >
                            <View style={styles.menuItem}>
                                <View style={styles.menuItemIconContainer}>
                                    <Settings
                                        height={20}
                                        width={20}
                                        color={theme.colors.grey9}
                                        style={styles.menuItemIcon}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.menuItemText}>Settings</Text>
                                </View>
                            </View>
                            <NavArrowRight width={25} height={30} color={theme.colors.grey9} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.drawerFooter}>
                    <TouchableOpacity
                        style={styles.menuItemContainer}
                        onPress={() => props.navigation.getParent()?.navigate('Support')}
                    >
                        <View style={styles.menuItem}>
                            <View style={styles.menuItemIconContainer}>
                                <HeadsetHelp
                                    height={20}
                                    width={20}
                                    color={theme.colors.grey9}
                                    style={styles.menuItemIcon}
                                />
                            </View>
                            <View>
                                <Text style={styles.menuItemText}>Support</Text>
                            </View>
                        </View>
                        <NavArrowRight width={25} height={30} color={theme.colors.grey9} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.menuItemContainer}
                        onPress={async () => {
                            await userStore.logout('Logout in main menu');
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
                </View>
            </DrawerContentScrollView>
            {/* Can be Used in Future , Will be discussed too  */}
            {/* <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#ccc' }}>
                <TouchableOpacity
                    onPress={async () => {
                        // onShare();
                    }}
                    style={{ paddingVertical: 15 }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="logout"> </Icon>    
                    <TButtonText>Logout</TButtonText>
                    </View>
                </TouchableOpacity>
            </View> */}
        </View>
    );
}

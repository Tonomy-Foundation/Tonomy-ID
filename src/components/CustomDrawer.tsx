import React from 'react';

import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Image, StyleSheet, View } from 'react-native';
import TButton from './atoms/Tbutton';
import { useTheme } from '@react-navigation/native';
import { RouteDrawerParamList } from '../navigation/Drawer';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';

const icons: Record<keyof RouteDrawerParamList, IconSource> = {
    UserHome: 'home',
    Settings: 'cog',
    Help: 'help-circle',
    Logout: 'logout',
    SSO: 'login',
};
export default function CustomDrawer(props: DrawerContentComponentProps) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const logo1024 = require('../assets/tonomy/tonomy-logo1024.png');
    const theme = useTheme();
    const styles = StyleSheet.create({
        container: {
            padding: 20,
            backgroundColor: theme.colors.background,
            // backgroundColor: 'red',
        },
        logo: {
            height: 100,
            width: 100,
            resizeMode: 'cover',
        },
        menu: {
            paddingVertical: 16,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            marginTop: 40,
        },
        button: {
            alignItems: 'flex-start',
        },
    });

    return (
        <DrawerContentScrollView {...props} style={styles.container}>
            <Image source={logo1024} style={styles.logo}></Image>
            <View style={styles.menu}>
                {Object.entries(props.descriptors).map(([key, value]) => {
                    return (
                        <TButton
                            style={styles.button}
                            key={key}
                            onPress={() => props.navigation.getParent()?.navigate(value.route.name)}
                            icon={icons[value.route.name]}
                            color={theme.colors.text}
                        >
                            {value.options.title || value.route.name}
                        </TButton>
                    );
                })}
            </View>
        </DrawerContentScrollView>
    );
}

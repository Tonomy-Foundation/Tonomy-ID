import React from 'react';

import { DrawerContentScrollView, DrawerContentComponentProps, DrawerItem } from '@react-navigation/drawer';
import { Image, StyleSheet, View } from 'react-native';
import settings from '../settings';
import { IconButtonProps, Text } from 'react-native-paper';
import TButton from './Tbutton';
import { useTheme } from '@react-navigation/native';

const icons = {
    settings: 'cog',
    help: 'help-circle',
    logout: 'logout',
};
export default function CustomDrawer(props: DrawerContentComponentProps) {
    const theme = useTheme();
    const styles = StyleSheet.create({
        container: {
            padding: 20,
            backgroundColor: theme.colors.background,
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
            minWidth: 1000,
        },
    });

    return (
        <DrawerContentScrollView {...props} style={styles.container}>
            <Image source={settings.config.images.logo1024} style={styles.logo}></Image>
            <View style={styles.menu}>
                {Object.entries(props.descriptors).map(([key, value]) => {
                    return (
                        <TButton
                            style={styles.button}
                            key={key}
                            onPress={() => props.navigation.getParent()?.navigate(value.route.name)}
                            icon={icons[value.route.name]}
                        >
                            {value.options.title || value.route.name}
                        </TButton>
                    );
                })}
            </View>
        </DrawerContentScrollView>
    );
}

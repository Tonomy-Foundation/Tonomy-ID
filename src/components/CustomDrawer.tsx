import React from 'react';

import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Image, StyleSheet, View } from 'react-native';
import TButton, { TButtonText } from './atoms/Tbutton';
import { useTheme } from '@react-navigation/native';
import { RouteDrawerParamList } from '../navigation/Drawer';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { TouchableOpacity } from 'react-native-gesture-handler';
import useUserStore, { UserStatus } from '../store/userStore';

const icons: Record<keyof RouteDrawerParamList, IconSource> = {
    UserHome: 'home',
    Settings: 'cog',
    Help: 'help-circle',
    Logout: 'logout',
    ChangePin: 'security',
    SSO: 'login',
};

export default function CustomDrawer(props: DrawerContentComponentProps) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const logo1024 = require('../assets/tonomy/tonomy-logo1024.png');
    const { user, setStatus } = useUserStore();
    const theme = useTheme();
    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
        },
        logo: {
            height: 100,
            width: 100,
            resizeMode: 'cover',
            margin: 16,
        },
        menu: {
            paddingVertical: 16,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            marginTop: 40,
        },
        button: {
            justifyContent: 'flex-start',
        },
    });

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props} style={styles.container}>
                <Image source={logo1024} style={styles.logo}></Image>
                <View style={styles.menu}>
                    {Object.entries(props.descriptors).map(([key, value]) => (
                        <TButton
                            style={styles.button}
                            key={key}
                            onPress={() => props.navigation.getParent()?.navigate(value.route.name)}
                            icon={icons[value.route.name]}
                            color={theme.colors.text}
                        >
                            {value.options.title || value.route.name}
                        </TButton>
                    ))}
                    <TButton
                        style={styles.button}
                        onPress={async () => {
                            await user.logout();
                            setStatus(UserStatus.NOT_LOGGED_IN);
                        }}
                        icon={icons['Logout']}
                        color={theme.colors.text}
                    >
                        {'Logout'}
                    </TButton>
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

import React from 'react';

import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { StyleSheet, View } from 'react-native';
import TButton from './atoms/Tbutton';
import { RouteDrawerParamList } from '../navigation/Drawer';
import useUserStore, { UserStatus } from '../store/userStore';
import { useAppTheme } from '../utils/theme';

// https://callstack.github.io/react-native-paper/docs/guides/icons/
const icons: Record<keyof RouteDrawerParamList, string> = {
    UserHome: 'home',
    Settings: 'cog',
    Help: 'help-circle',
    Logout: 'logout',
    ChangePin: 'security',
    SSO: 'login',
};

export default function CustomDrawer(props: DrawerContentComponentProps) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { user, setStatus } = useUserStore();
    const theme = useAppTheme();
    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
        },
        logoContainer: {
            justifyContent: 'center',
            alignItems: 'center',
            // flex: 1,
            padding: 16,
        },
        logo: {
            // marginHorizontal: 'auto',
            height: 100,
            width: 100,
            resizeMode: 'cover',
            // margin: 16,
        },
        menu: {
            paddingVertical: 16,
            borderTopColor: theme.colors.grey3,
            // borderTopWidth: 1,
            marginTop: 16,
        },
        button: {
            justifyContent: 'flex-start',
        },
    });

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props} style={styles.container}>
                {/* <View style={styles.logoContainer}>
                    <Image source={logo1024} style={styles.logo}></Image>
                </View> */}

                <View style={styles.menu}>
                    {Object.entries(props.descriptors).map(([key, value]) => (
                        <TButton
                            style={styles.button}
                            key={key}
                            onPress={() => props.navigation.getParent()?.navigate(value.route.name)}
                            icon={icons[value.route.name]}
                            color={theme.colors.grey2}
                            size="huge"
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
                        color={theme.colors.grey2}
                        size="huge"
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

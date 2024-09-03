import React from 'react';

import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { StyleSheet, View } from 'react-native';
import TButton from './atoms/TButton';
import { DrawerStackParamList } from '../navigation/Drawer';
import useUserStore, { UserStatus } from '../store/userStore';
import { useAppTheme } from '../utils/theme';
import { appStorage, keyStorage } from '../utils/StorageManager/setup';
import useWalletStore from '../store/useWalletStore';

// https://callstack.github.io/react-native-paper/docs/guides/icons/
const icons: Record<keyof DrawerStackParamList, string> = {
    UserHome: 'home',
    BottomTabs: 'home',
    Settings: 'cog',
    Help: 'help-circle',
    Logout: 'logout',
    ChangePin: 'security',
    SSO: 'login',
    SignTransaction: 'SignTransaction',
    WalletConnectLogin: 'WalletConnectLogin',
    CreateEthereumKey: 'CreateEthereumKey',
};

export default function CustomDrawer(props: DrawerContentComponentProps) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { logout } = useUserStore();
    const { clearState } = useWalletStore();

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
                <View style={styles.menu}>
                    <TButton
                        style={styles.button}
                        onPress={() => props.navigation.getParent()?.navigate('Settings')}
                        icon={icons['Settings']}
                        color={theme.colors.grey2}
                        size="huge"
                    >
                        {'Settings'}
                    </TButton>
                    <TButton
                        style={styles.button}
                        onPress={async () => {
                            await logout('Logout in main menu');

                            clearState();
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

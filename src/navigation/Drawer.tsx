import React from 'react';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
import CustomDrawer from '../components/CustomDrawer';
// import MainScreen from '../screens/MainScreen';
import SettingsNavigation from './Settings';
import { useAppTheme } from '../utils/theme';
import { SignClientTypes } from '@walletconnect/types';
import { IPrivateKey, ISession, ITransaction } from '../utils/chain/types';
import BottomTabNavigator from './BottomTabNavigator';

export type DrawerStackParamList = {
    UserHome: { did?: string };
    Settings: undefined;
    Help: undefined;
    Logout: undefined;
    ChangePin: undefined;
    SSO: { payload: string; platform: 'mobile' | 'browser' };
    SignTransaction: {
        transaction: ITransaction;
        privateKey: IPrivateKey;
        session: ISession;
    };
    WalletConnectLogin: {
        payload: SignClientTypes.EventArguments['session_proposal'];
        platform: 'mobile' | 'browser';
    };
    CreateEthereumKey?: {
        transaction?: {
            transaction: ITransaction;
            session: ISession;
        };
        payload?: SignClientTypes.EventArguments['session_proposal'];
        requestType?: string;
    };
    BottomTabs: undefined;
};

const Drawer = createDrawerNavigator<DrawerStackParamList>();

export default function DrawerNavigation() {
    const theme = useAppTheme();
    const defaultScreenOptions: DrawerNavigationOptions = {
        headerStyle: {
            shadowColor: theme.colors.shadow,
        },
        headerTitleStyle: {
            fontSize: 24,
            color: theme.colors.text,
        },
        headerTitleAlign: 'center',
        headerTintColor: theme.colors.text,
    };

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawer {...props} />}
            initialRouteName="BottomTabs"
            screenOptions={defaultScreenOptions}
        >
            <Drawer.Screen name="BottomTabs" options={{ headerShown: false }} component={BottomTabNavigator} />
            {/* change component to Main Navigation when bottom nav should be added */}
            {/* <Drawer.Screen name="UserHome" options={{ title: 'Home' }} component={MainScreen} /> */}

            <Drawer.Screen
                name="Settings"
                options={{ title: 'Settings', headerShown: false }}
                component={SettingsNavigation}
            />
        </Drawer.Navigator>
    );
}

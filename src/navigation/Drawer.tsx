import React from 'react';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
import CustomDrawer from '../components/CustomDrawer';
import { useTheme } from 'react-native-paper';
import MainScreen from '../screens/MainScreen';
import SettingsNavigation from './Settings';
import { LoginRequest } from '@tonomy/tonomy-id-sdk';

export type RouteDrawerParamList = {
    UserHome: undefined;
    Settings: undefined;
    Help: undefined;
    Logout: undefined;
    ChangePin: undefined;

    SSO: { requests: LoginRequest[]; platform: 'mobile' | 'browser' };
};

const Drawer = createDrawerNavigator<RouteDrawerParamList>();

export default function DrawerNavigation() {
    const theme = useTheme();
    const defaultScreenOptions: DrawerNavigationOptions = {
        headerStyle: {
            backgroundColor: theme.colors.primary,
        },
        headerTitleStyle: {
            fontSize: 24,
            color: '#474D4C',
        },
        headerTitleAlign: 'left',
        headerTintColor: theme.dark ? theme.colors.text : 'white',
    };

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawer {...props} />}
            initialRouteName="UserHome"
            screenOptions={defaultScreenOptions}
        >
            {/* change component to Main Navigation when bottom nav should be added */}
            <Drawer.Screen name="UserHome" options={{ title: 'Home' }} component={MainScreen} />

            <Drawer.Screen
                name="Settings"
                options={{ title: 'Settings', headerShown: false }}
                component={SettingsNavigation}
            />
        </Drawer.Navigator>
    );
}

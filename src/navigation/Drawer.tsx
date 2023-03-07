import React from 'react';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
import TestScreen from '../screens/testScreen';
import CustomDrawer from '../components/CustomDrawer';
import { useTheme } from 'react-native-paper';
import MainScreen from '../screens/MainScreen';
import settings from '../settings';
import MainNavigation from './Main';
import SSOLoginScreen from '../screens/SSOLoginScreen';

export type RouteDrawerParamList = {
    UserHome: undefined;
    Settings: undefined;
    Help: undefined;
    Logout: undefined;
    SSO: { requests: string; platform: 'mobile' | 'browser' };
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
            {/* <Drawer.Screen name="Settings" component={TestScreen} /> */}
            {/* <Drawer.Screen name="Help" component={TestScreen} options={{ title: 'Help and Info' }} /> */}
            {/* <Drawer.Screen name="Logout" component={TestScreen} /> */}
        </Drawer.Navigator>
    );
}

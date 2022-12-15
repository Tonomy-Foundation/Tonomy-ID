import React from 'react';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';

import TestScreen from '../screens/testScreen';
import CustomDrawer from '../components/CustomDrawer';
import { useTheme } from 'react-native-paper';
import MainScreen from '../screens/MainScreen';
import settings from '../settings';
import MainNavigation from './Main';
import SSOLoginScreen from '../screens/SSOLoginScreen';
const Drawer = createDrawerNavigator();

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
            initialRouteName="t"
            screenOptions={defaultScreenOptions}
        >
            {/* change component to Main Navigation when bottom nav should be added */}
            <Drawer.Screen name="home" options={{ title: settings.config.appName }} component={MainScreen} />
            <Drawer.Screen name="settings" component={TestScreen} />
            <Drawer.Screen name="help" component={TestScreen} options={{ title: 'Help and Info' }} />
            <Drawer.Screen name="logout" component={TestScreen} />
            <Drawer.Screen name="sso" options={{ title: 'test sso' }} component={SSOLoginScreen} />
        </Drawer.Navigator>
    );
}

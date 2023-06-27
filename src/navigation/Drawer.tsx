import React from 'react';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
import CustomDrawer from '../components/CustomDrawer';
import MainScreen from '../screens/MainScreen';
import SettingsNavigation from './Settings';
import { useAppTheme } from '../utils/theme';

export type DrawerStackParamList = {
    UserHome: undefined;
    Settings: undefined;
    Help: undefined;
    Logout: undefined;
    ChangePin: undefined;
    SSO: { payload: string; platform: 'mobile' | 'browser' };
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

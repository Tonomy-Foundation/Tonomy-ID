import React from 'react';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';

import HomeScreen from '../screens/testScreen';
import MenuScreen from '../screens/MenuScreen';
import CustomDrawer from '../components/customDrawer';
import CreateAccountUsernameScreen from '../screens/CreateAccountUsernameScreen';
import { useTheme } from 'react-native-paper';

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
            <Drawer.Screen name="t" component={HomeScreen} />
            <Drawer.Screen name="settings" component={HomeScreen} />
            <Drawer.Screen name="help" component={HomeScreen} options={{ title: 'Help and Info' }} />
            <Drawer.Screen name="logout" component={HomeScreen} />
        </Drawer.Navigator>
    );
}

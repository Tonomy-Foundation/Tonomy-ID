import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeScreen from '../screens/testScreen';
import MenuScreen from '../screens/MenuScreen';
import CustomDrawer from '../components/customDrawer';
import CreateAccountUsernameScreen from '../screens/CreateAccountUsernameScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigation() {
    return (
        <Drawer.Navigator drawerContent={(props) => <CustomDrawer {...props} />} initialRouteName="t">
            <Drawer.Screen name="t" component={HomeScreen} />
            <Drawer.Screen name="settings" component={HomeScreen} />
            <Drawer.Screen name="help" component={HomeScreen} options={{ title: 'Help and Info' }} />
            <Drawer.Screen name="logout" component={HomeScreen} />
        </Drawer.Navigator>
    );
}

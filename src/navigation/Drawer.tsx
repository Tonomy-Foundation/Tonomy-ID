import React from 'react';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
import CustomDrawer from '../components/CustomDrawer';
import { useAppTheme } from '../utils/theme';
import BottomTabNavigator from './BottomTabNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import { TouchableOpacity } from 'react-native';
import MenuIcon from '../assets/icons/MenuIcon';
import SupportScreen from '../screens/SupportScreen';

export type DrawerStackParamList = {
    UserHome: { did?: string };
    Settings: undefined;
    Support: undefined;
    Help: undefined;
    Logout: undefined;
    ChangePin: undefined;
    SSO: { payload: string; platform: 'mobile' | 'browser' };
    BottomTabs: undefined;
};

const Drawer = createDrawerNavigator<DrawerStackParamList>();

export default function DrawerNavigation() {
    const theme = useAppTheme();
    const defaultScreenOptions: DrawerNavigationOptions = {
        headerTitleStyle: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.colors.text,
        },
        headerTitleAlign: 'center',
        headerTintColor: theme.dark ? theme.colors.text : 'black',
    };

    const drawerScreenOptions = ({ navigation }) => ({
        headerLeft: () => (
            <TouchableOpacity
                style={{ paddingHorizontal: 15, paddingVertical: 10 }}
                onPress={() => navigation.toggleDrawer()}
            >
                <MenuIcon />
            </TouchableOpacity>
        ),
    });

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawer {...props} />}
            initialRouteName="BottomTabs"
            screenOptions={defaultScreenOptions}
        >
            <Drawer.Screen name="BottomTabs" options={{ headerShown: false }} component={BottomTabNavigator} />
            <Drawer.Screen name="Settings" options={drawerScreenOptions} component={SettingsScreen} />
            <Drawer.Screen name="Support" options={drawerScreenOptions} component={SupportScreen} />
        </Drawer.Navigator>
    );
}

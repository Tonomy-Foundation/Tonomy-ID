import { BottomTabBarButtonProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useRef } from 'react';

import AppsScreen from '../screens/Apps';
import CitizenshipScreen from '../screens/Citizenship';
import AssetsScreen from '../screens/Assets';
import ExploreScreen from '../screens/Explore';

import theme, { useAppTheme } from '../utils/theme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CitizenshipIcon from '../assets/icons/CitizenshipIcon';
import AssetsIcon from '../assets/icons/AssetsIcon';
import ScanIcon from '../assets/icons/ScanIcon';
import ExploreIcon from '../assets/icons/ExploreIcon';
import AppsIcon from '../assets/icons/AppsIcon';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import MenuIcon from '../assets/icons/MenuIcon';

import ScanQRScreen from '../screens/ScanQRScreen';
import ArrowBackIcon from '../assets/icons/ArrowBackIcon';

export type RouteStackParamList = {
    UserHome: { did?: string };
    Citizenship: undefined;
    Assets: { did?: string };
    Explore: undefined;
    Scan: undefined;
    Apps: undefined;
    ScanQR: undefined;
};

const Tab = createBottomTabNavigator<RouteStackParamList>();

type ScanTabBarButtonProps = BottomTabBarButtonProps;
const ScanTabBarButton: React.FC<ScanTabBarButtonProps> = ({ children, onPress }) => {
    return (
        <>
            <TouchableOpacity style={{ top: -30, justifyContent: 'center', alignContent: 'center' }} onPress={onPress}>
                <View
                    style={{
                        width: 70,
                        height: 70,
                        borderRadius: 35,
                        backgroundColor: theme.colors.black,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {children}
                </View>
            </TouchableOpacity>
        </>
    );
};

type DrawerNavigation = DrawerNavigationProp<RouteStackParamList, 'Citizenship'>;

function BottomTabNavigator() {
    const theme = useAppTheme();
    const navigation = useNavigation<DrawerNavigation>();
    return (
        <Tab.Navigator
            initialRouteName="Citizenship"
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.grey,
                headerStyle: {
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                },
                headerTitleStyle: {
                    fontSize: 16,
                    fontWeight: '500',
                    color: theme.colors.text,
                },
                headerTitleAlign: 'center',
                headerTintColor: theme.dark ? theme.colors.text : 'black',
                headerLeft: () => (
                    <TouchableOpacity
                        style={{ paddingHorizontal: 15, paddingVertical: 10 }}
                        onPress={() => navigation.toggleDrawer()}
                    >
                        <MenuIcon />
                    </TouchableOpacity>
                ),
            }}
        >
            <Tab.Screen
                name="Citizenship"
                component={CitizenshipScreen}
                options={{
                    headerTitle: 'Citizenship',
                    tabBarLabel: ({ focused }) => (
                        <Text
                            style={[styles.tabLabel, { color: !focused ? theme.colors.tabGray : theme.colors.black }]}
                        >
                            Citizenship
                        </Text>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <CitizenshipIcon
                            width={28}
                            height={28}
                            color={!focused ? theme.colors.tabGray : theme.colors.black}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Assets"
                component={AssetsScreen}
                options={{
                    tabBarLabel: ({ focused }) => (
                        <Text
                            style={[styles.tabLabel, { color: !focused ? theme.colors.tabGray : theme.colors.black }]}
                        >
                            Assets
                        </Text>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <AssetsIcon
                            width={28}
                            height={28}
                            color={!focused ? theme.colors.tabGray : theme.colors.black}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="ScanQR"
                component={ScanQRScreen}
                options={{
                    headerTitle: 'Scan QR',
                    headerLeft: () => (
                        <TouchableOpacity
                            style={{ paddingHorizontal: 5, paddingVertical: 10 }}
                            onPress={() => navigation.navigate('Assets', {})}
                        >
                            <ArrowBackIcon />
                        </TouchableOpacity>
                    ),
                    tabBarLabel: () => null,
                    tabBarIcon: () => <ScanIcon width={28} height={28} />,
                    tabBarButton: (props) => <ScanTabBarButton {...props} />,
                }}
            />
            <Tab.Screen
                name="Explore"
                component={ExploreScreen}
                options={{
                    tabBarLabel: ({ focused }) => (
                        <Text
                            style={[styles.tabLabel, { color: !focused ? theme.colors.tabGray : theme.colors.black }]}
                        >
                            Explore
                        </Text>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <ExploreIcon
                            width={28}
                            height={28}
                            color={!focused ? theme.colors.tabGray : theme.colors.black}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Apps"
                component={AppsScreen}
                options={{
                    tabBarLabel: ({ focused }) => (
                        <Text
                            style={[styles.tabLabel, { color: !focused ? theme.colors.tabGray : theme.colors.black }]}
                        >
                            Apps
                        </Text>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <AppsIcon width={28} height={28} color={!focused ? theme.colors.tabGray : theme.colors.black} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
    },
});

export default BottomTabNavigator;

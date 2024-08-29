import { BottomTabBarButtonProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import AppsScreen from '../screens/Apps';
import CitizenshipScreen from '../screens/Citizenship';
import AssetsScreen from '../screens/Assets';
import ExploreScreen from '../screens/Explore';
import ScanScreen from '../screens/Scan';

import theme, { useAppTheme } from '../utils/theme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CitizenshipIcon from '../assets/icons/CitizenshipIcon';
import AssetsIcon from '../assets/icons/AssetsIcon';
import ScanIcon from '../assets/icons/ScanIcon';
import ExploreIcon from '../assets/icons/ExploreIcon';
import AppsIcon from '../assets/icons/AppsIcon';
import MainScreen from '../screens/MainScreen';

export type RouteStackParamList = {
    UserHome: { did?: string };
    Assets: undefined;
    Explore: undefined;
    Scan: undefined;
    Apps: undefined;
};

const Tab = createBottomTabNavigator<RouteStackParamList>();

type ScanTabBarButtonProps = BottomTabBarButtonProps;
const ScanTabBarButton: React.FC<ScanTabBarButtonProps> = ({ children, onPress }) => (
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
);

function BottomTabNavigator() {
    const theme = useAppTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.grey,
                headerShown: false, // or true if you want headers on tabs
            }}
        >
            <Tab.Screen
                name="UserHome"
                component={MainScreen}
                options={{
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
                name="Scan"
                component={ScanScreen}
                options={{
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

import { BottomTabBarButtonProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useRef } from 'react';

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
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import MenuIcon from '../assets/icons/MenuIcon';

import QRScan from '../components/QRScan';

export type RouteStackParamList = {
    UserHome: { did?: string };
    Assets: { did?: string };
    Explore: undefined;
    Scan: undefined;
    Apps: undefined;
};

const Tab = createBottomTabNavigator<RouteStackParamList>();

type ScanTabBarButtonProps = BottomTabBarButtonProps;
const ScanTabBarButton: React.FC<ScanTabBarButtonProps> = ({ children, onPress }) => {
    const refMessage = useRef(null);
    const handleOpenQRScan = () => {
        (refMessage?.current as any)?.open();
    };
    const onClose = () => {
        (refMessage.current as any)?.close();
    };
    return (
        <>
            <QRScan onClose={onClose} refMessage={refMessage} />
            <TouchableOpacity
                style={{ top: -30, justifyContent: 'center', alignContent: 'center' }}
                onPress={handleOpenQRScan}
            >
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

type DrawerNavigation = DrawerNavigationProp<RouteStackParamList, 'UserHome'>;

function BottomTabNavigator() {
    const theme = useAppTheme();
    const navigation = useNavigation<DrawerNavigation>();
    return (
        <Tab.Navigator
            initialRouteName="Assets"
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
                name="UserHome"
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

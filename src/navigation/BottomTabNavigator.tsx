import { BottomTabBarButtonProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import AppsScreen from '../screens/AppsScreen';
import CitizenshipScreen from '../screens/CitizenshipScreen';
import AssetListingScreen from '../screens/AssetListingScreen';
import ExploreScreen from '../screens/ExploreScreen';
import theme, { useAppTheme } from '../utils/theme';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScanIcon from '../assets/icons/ScanIcon';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import MenuIcon from '../assets/icons/MenuIcon';
import ScanQRScreen from '../screens/ScanQRScreen';
import { ArrowLeft, Community, Compass, GridPlus, Wallet } from 'iconoir-react-native';
import { BottonNavigatorRouteStackParamList } from './Root';

const Tab = createBottomTabNavigator<BottonNavigatorRouteStackParamList>();

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
                        <Community
                            width={28}
                            height={28}
                            color={!focused ? theme.colors.tabGray : theme.colors.black}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Assets"
                component={AssetListingScreen}
                options={{
                    tabBarLabel: ({ focused }) => (
                        <Text
                            style={[styles.tabLabel, { color: !focused ? theme.colors.tabGray : theme.colors.black }]}
                        >
                            Assets
                        </Text>
                    ),
                    tabBarIcon: ({ focused }) => (
                        <Wallet width={28} height={28} color={!focused ? theme.colors.tabGray : theme.colors.black} />
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
                            onPress={() => navigation.navigate('Assets')}
                        >
                            <ArrowLeft height={24} width={24} color={theme.colors.black} />
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
                        <Compass width={28} height={28} color={!focused ? theme.colors.tabGray : theme.colors.black} />
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
                        <GridPlus width={28} height={28} color={!focused ? theme.colors.tabGray : theme.colors.black} />
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

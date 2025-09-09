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
import { ArrowLeft, Compass, GridPlus, UserCircle, Wallet, WalletSolid } from 'iconoir-react-native';
import { BottonNavigatorRouteStackParamList, RouteStackParamList } from './Root';
import UserCircleSolid from '../assets/icons/UserCircleSolid';
import CompassSolid from '../assets/icons/CompassSolid';
import GridPlusSolid from '../assets/icons/GridPlusSolid';
import AppInstructionProvider from '../providers/AppInstruction';
import { isIpad } from '../utils/device';

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
                        backgroundColor: theme.colors.primary,
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

function BottomTabNavigator(props) {
    const theme = useAppTheme();
    const navigation = useNavigation<DrawerNavigation>();

    return (
        <>
            <AppInstructionProvider />
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
                    },
                    headerTitleAlign: 'center',
                    headerTintColor: theme.dark ? theme.colors.text : 'primary',
                    headerLeft: () => (
                        <TouchableOpacity
                            style={{ paddingHorizontal: 15, paddingVertical: 10 }}
                            onPress={() => navigation.toggleDrawer()}
                        >
                            <MenuIcon />
                        </TouchableOpacity>
                    ),
                    tabBarStyle: {
                        borderTopWidth: 1,
                        borderTopColor: theme.colors.border,
                        paddingTop: isIpad ? 10 : 20,
                    },
                    tabBarItemStyle: {
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                }}
            >
                <Tab.Screen
                    name="Citizenship"
                    component={CitizenshipScreen}
                    options={{
                        headerTitle: 'Citizenship',
                        tabBarLabel: ({ focused }) => (
                            <Text
                                style={[
                                    styles.tabLabel,
                                    { color: !focused ? theme.colors.tabGray : theme.colors.primary },
                                ]}
                            >
                                Citizenship
                            </Text>
                        ),
                        tabBarIcon: ({ focused }) =>
                            focused ? (
                                <UserCircleSolid color={theme.colors.primary} />
                            ) : (
                                <UserCircle
                                    width={28}
                                    height={28}
                                    color={!focused ? theme.colors.tabGray : theme.colors.primary}
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
                                style={[
                                    styles.tabLabel,
                                    { color: !focused ? theme.colors.tabGray : theme.colors.primary },
                                ]}
                            >
                                Assets
                            </Text>
                        ),
                        tabBarIcon: ({ focused }) =>
                            focused ? (
                                <WalletSolid width={28} height={28} color={theme.colors.primary} />
                            ) : (
                                <Wallet width={28} height={28} color={theme.colors.tabGray} />
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
                                <ArrowLeft height={24} width={24} color={theme.colors.primary} />
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
                                style={[
                                    styles.tabLabel,
                                    { color: !focused ? theme.colors.tabGray : theme.colors.primary },
                                ]}
                            >
                                Explore
                            </Text>
                        ),
                        tabBarIcon: ({ focused }) =>
                            focused ? (
                                <CompassSolid color={theme.colors.primary} />
                            ) : (
                                <Compass
                                    width={28}
                                    height={28}
                                    color={!focused ? theme.colors.tabGray : theme.colors.primary}
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
                                style={[
                                    styles.tabLabel,
                                    { color: !focused ? theme.colors.tabGray : theme.colors.primary },
                                ]}
                            >
                                Apps
                            </Text>
                        ),
                        tabBarIcon: ({ focused }) =>
                            focused ? (
                                <GridPlusSolid color={theme.colors.primary} />
                            ) : (
                                <GridPlus
                                    width={28}
                                    height={28}
                                    color={!focused ? theme.colors.tabGray : theme.colors.primary}
                                />
                            ),
                    }}
                />
            </Tab.Navigator>
        </>
    );
}

const styles = StyleSheet.create({
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: isIpad ? 0 : 13,
    },
});

export default BottomTabNavigator;

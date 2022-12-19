import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainScreen from '../screens/MainScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from 'react-native-paper';

export type RouteTabParamList = {
    Data: undefined;
    NotData: undefined;
};

const Tab = createBottomTabNavigator<RouteTabParamList>();

export default function MainNavigation() {
    const theme = useTheme();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: React.ComponentProps<typeof Ionicons>['name'];
                    switch (route.name) {
                        case 'Data':
                            iconName = focused ? 'md-add-circle' : 'md-add-circle-outline';
                            break;
                        default:
                            iconName = focused ? 'md-home' : 'md-home-outline';
                            break;
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarStyle: {
                    backgroundColor: theme.colors.primary,
                },
                tabBarActiveTintColor: theme.colors.background,
                tabBarInactiveTintColor: theme.colors.background,
            })}
        >
            <Tab.Screen name="Data" options={{ tabBarLabel: 'Data' }} component={MainScreen} />
            <Tab.Screen name="NotData" options={{ tabBarLabel: 'Not Data' }} component={MainScreen} />
        </Tab.Navigator>
    );
}

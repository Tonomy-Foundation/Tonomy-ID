import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import HomeScreen from '../screens/homeScreen';
import useUserStore, { UserStatus } from '../store/userStore';
import FingerprintUpdateScreen from '../screens/FingerprintUpdateScreen';

import DrawerNavigation from './Drawer';
import settings from '../settings';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme, useNavigation } from '@react-navigation/native';
import { IconButton, useTheme } from 'react-native-paper';
import merge from 'deepmerge';
import * as Linking from 'expo-linking';
import SSOLoginScreen from '../screens/SSOLoginScreen';
import LoginUsernameScreen from '../screens/LoginUsernameScreen';
import LoginPasswordScreen from '../screens/LoginPasswordScreen';
import LoginPinScreen from '../screens/LoginPinScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import TIconButton from '../components/TIconButton';
import ConfirmPasswordScreen from '../screens/ConfirmPasswordScreen';
import SetPasswordScreen from '../screens/SetPasswordScreen';

const prefix = Linking.createURL('');

export type RouteStackParamList = {
    Splash: undefined;
    Settings: undefined;
    ChangePassword: undefined;
    ConfirmPassword: undefined;
    SetPassword: undefined;
};

const Stack = createNativeStackNavigator<RouteStackParamList>();

export default function SettingsNavigation() {
    const linking = {
        prefixes: [prefix],
    };

    // Setup styles
    const theme = useTheme();
    const navigationTheme: typeof NavigationDefaultTheme = {
        ...NavigationDefaultTheme,
        colors: {
            ...NavigationDefaultTheme.colors,
            text: 'white',
            background: theme.colors.background,
        },
    };
    const navigation = useNavigation();
    const backButton = () => {
        return (
            <TouchableOpacity onPress={() => navigation.navigate('UserHome')}>
                <IconButton icon={Platform.OS === 'android' ? 'arrow-left' : 'chevron-left'} size={32} />
            </TouchableOpacity>
        );
    };
    const defaultScreenOptions: NativeStackNavigationOptions = {
        headerShown: true,
        headerBackTitleVisible: false,
        headerStyle: {
            // backgroundColor: theme.colors.,
            backgroundColor: '#F9F9F9',
        },
        headerTitleStyle: {
            fontSize: 24,
            color: 'black',
        },
        headerTitleAlign: 'center',
        headerTintColor: theme.dark ? theme.colors.text : 'black',
    };

    const noHeaderScreenOptions = { headerShown: false };
    const CombinedDefaultTheme = merge(navigationTheme, theme);

    return (
        <Stack.Navigator initialRouteName={'Splash'} screenOptions={defaultScreenOptions}>
            <Stack.Screen
                name="Settings"
                options={{ title: 'Settings', headerLeft: backButton }}
                component={SettingsScreen}
            />
            <Stack.Screen
                name="ConfirmPassword"
                options={{ title: 'Confirm Password ' }}
                component={ConfirmPasswordScreen}
            />
            <Stack.Screen name="SetPassword" options={{ title: 'Set Password' }} component={SetPasswordScreen} />
        </Stack.Navigator>
    );
}

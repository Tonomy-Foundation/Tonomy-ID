import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../screens/homeScreen';
import TestScreen from '../screens/testScreen';
import PinScreen from '../screens/PinScreen';
import CreateAccountUsernameScreen from '../screens/CreateAccountUsernameScreen';
import CreateAccountPasswordScreen from '../screens/CreateAccountPasswordScreen';
import MainSplashScreen from '../screens/MainSplashScreen';
import SplashSecurityScreen from '../screens/SplashSecurityScreen';
import SplashPrivacyScreen from '../screens/SplashPrivacyScreen';
import SplashTransparencyScreen from '../screens/SplashTransparencyScreen';
import useUserStore from '../store/userStore';
import FingerprintUpdateScreen from '../screens/FingerprintUpdateScreen';
import QrCodeScanScreen from '../screens/QrCodeScanScreen';
import DrawerNavigation from './Drawer';
import settings from '../settings';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import merge from 'deepmerge';
import * as Linking from 'expo-linking';
import SSOLoginScreen from '../screens/SSOLoginScreen';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/core';

const prefix = Linking.createURL('');

export type RouteStackParamList = {
    Splash: undefined;
    SplashSecurity: undefined;
    SplashPrivacy: undefined;
    SplashTransparency: undefined;
    Home: undefined;
    CreateAccountUsername: undefined;
    CreateAccountPassword: undefined;
    CreateAccountPin: { password: string };
    CreateAccountFingerprint: { password: string };
    Login: undefined;
    UserHome: undefined;
    Test: undefined;
    Drawer: undefined;
    Settings: undefined;
    QrScanner: undefined;
    SSO: { requests: string };
};
const Stack = createNativeStackNavigator<RouteStackParamList>();

export default function RootNavigation() {
    const linking = {
        prefixes: [prefix],
    };
    const user = useUserStore();
    const theme = useTheme();
    // https://reactnavigation.org/docs/native-stack-navigator/#options
    const navigationTheme: typeof NavigationDefaultTheme = {
        ...NavigationDefaultTheme,
        colors: {
            ...NavigationDefaultTheme.colors,
            text: 'white',
            background: theme.colors.background,
        },
    };

    const defaultScreenOptions: NativeStackNavigationOptions = {
        headerStyle: {
            backgroundColor: theme.colors.primary,
        },
        headerTitleStyle: {
            fontSize: 24,
        },
        headerTitleAlign: 'center',
        headerTintColor: theme.dark ? theme.colors.text : 'white',
    };

    const noHeaderScreenOptions = { headerShown: false };
    const CombinedDefaultTheme = merge(navigationTheme, theme);

    return (
        <NavigationContainer theme={CombinedDefaultTheme} linking={linking}>
            <Stack.Navigator initialRouteName="Splash" screenOptions={defaultScreenOptions}>
                <Stack.Screen name="Test" component={TestScreen} />
                <Stack.Screen name="Home" options={noHeaderScreenOptions} component={HomeScreen} />
                <Stack.Screen
                    name="Drawer"
                    component={DrawerNavigation}
                    options={{ headerShown: false, title: settings.config.appName }}
                />
                <Stack.Screen name="Splash" options={noHeaderScreenOptions} component={MainSplashScreen} />
                <Stack.Screen name="SplashSecurity" options={noHeaderScreenOptions} component={SplashSecurityScreen} />
                <Stack.Screen name="SplashPrivacy" options={noHeaderScreenOptions} component={SplashPrivacyScreen} />
                <Stack.Screen
                    name="SplashTransparency"
                    options={noHeaderScreenOptions}
                    component={SplashTransparencyScreen}
                />
                <Stack.Screen
                    name="CreateAccountUsername"
                    options={{ title: 'Create New Account' }}
                    component={CreateAccountUsernameScreen}
                />
                <Stack.Screen
                    name="CreateAccountPassword"
                    options={{ title: 'Create New Account' }}
                    component={CreateAccountPasswordScreen}
                />
                <Stack.Screen
                    name="CreateAccountFingerprint"
                    options={{ title: 'Fingerprint Registration' }}
                    component={FingerprintUpdateScreen}
                    initialParams={{ password: '' }}
                />
                <Stack.Screen name="CreateAccountPin" options={{ title: 'PIN' }} component={PinScreen} />
                <Stack.Screen
                    name="QrScanner"
                    options={{ title: settings.config.appName }}
                    component={QrCodeScanScreen}
                />
                <Stack.Screen
                    name="SSO"
                    options={{ ...noHeaderScreenOptions, title: settings.config.appName }}
                    component={SSOLoginScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export function useRootNavigator() {
    return useNavigation<NativeStackScreenProps<RouteStackParamList>['navigation']>();
}

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
import DrawerNavigation from './Drawer';
import settings from '../settings';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import merge from 'deepmerge';
import * as Linking from 'expo-linking';
import SSOLoginScreen from '../screens/SSOLoginScreen';

const prefix = Linking.createURL('');

const Stack = createNativeStackNavigator();

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
            <Stack.Navigator initialRouteName="mainSplash" screenOptions={defaultScreenOptions}>
                {/* TODO: fix user.isLoggedIn() always returns true */}
                {user.isLoggedIn() && false ? (
                    <>
                        <Stack.Screen name="test" component={TestScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="login-register" options={noHeaderScreenOptions} component={HomeScreen} />
                        <Stack.Screen
                            name="main"
                            component={DrawerNavigation}
                            options={{ headerShown: false, title: settings.config.appName }}
                        />

                        <Stack.Screen name="mainSplash" options={noHeaderScreenOptions} component={MainSplashScreen} />
                        <Stack.Screen
                            name="securitySplash"
                            options={noHeaderScreenOptions}
                            component={SplashSecurityScreen}
                        />
                        <Stack.Screen
                            name="privacySplash"
                            options={noHeaderScreenOptions}
                            component={SplashPrivacyScreen}
                        />
                        <Stack.Screen
                            name="transparencySplash"
                            options={noHeaderScreenOptions}
                            component={SplashTransparencyScreen}
                        />
                        <Stack.Screen
                            name="createAccountUsername"
                            options={{ title: 'Create New Account' }}
                            component={CreateAccountUsernameScreen}
                        />
                        <Stack.Screen
                            name="createAccountPassword"
                            options={{ title: 'Create New Account' }}
                            component={CreateAccountPasswordScreen}
                        />

                        <Stack.Screen
                            name="fingerprint"
                            options={{ title: 'Fingerprint Registration' }}
                            component={FingerprintUpdateScreen}
                        />
                        <Stack.Screen name="pin" options={{ title: 'PIN' }} component={PinScreen} />
                        <Stack.Screen
                            name="sso"
                            options={{ ...noHeaderScreenOptions, title: settings.config.appName }}
                            component={SSOLoginScreen}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

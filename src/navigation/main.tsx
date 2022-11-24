import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../screens/homeScreen';
import TestScreen from '../screens/testScreen';
import CreateAccountUsernameScreen from '../screens/CreateAccountUsernameScreen';
import CreateAccountPasswordScreen from '../screens/CreateAccountPasswordScreen';
import SplashSecurityScreen from '../screens/SplashSecurityScreen';
import SplashPrivacyScreen from '../screens/SplashPrivacyScreen';
import SplashTransparencyScreen from '../screens/SplashTransparencyScreen';
import useUserStore from '../store/userStore';
import FingerprintUpdateScreen from '../screens/FingerprintUpdateScreen';
import {
    NavigationContainer,
    DarkTheme as NavigationDarkTheme,
    DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { DarkTheme as PaperDarkTheme, useTheme } from 'react-native-paper';
import merge from 'deepmerge';

const CombinedDarkTheme = merge(NavigationDarkTheme, PaperDarkTheme);

const Stack = createNativeStackNavigator();

export default function MainNavigation() {
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
    const CombinedDefaultTheme = merge(theme, navigationTheme);
    return (
        <NavigationContainer theme={CombinedDefaultTheme}>
            <Stack.Navigator initialRouteName="securitySplash" screenOptions={defaultScreenOptions}>
                {/* TODO: fix user.isLoggedIn() always returns true */}
                {user.isLoggedIn() && false ? (
                    <>
                        <Stack.Screen name="test" component={TestScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="home" options={noHeaderScreenOptions} component={HomeScreen} />
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
                        <Stack.Screen name="fingerprint" component={FingerprintUpdateScreen} />
                        <Stack.Screen name="test" component={TestScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import theme, { customColors } from '../theme';

const Stack = createNativeStackNavigator();

// https://reactnavigation.org/docs/native-stack-navigator/#options
const defaultScreenOptions = {
    headerStyle: {
        backgroundColor: theme.colors.primary,
        height: 164,
    },
    headerTitleStyle: {
        fontSize: 24,
    },
    headerTitleAlign: 'center',
    headerTintColor: customColors.containedButtonTextColor,
};

export default function MainNavigation() {
    const user = useUserStore();
    return (
        <NavigationContainer theme={theme}>
            <Stack.Navigator initialRouteName="securitySplash" screenOptions={defaultScreenOptions}>
                {/* TODO: fix user.isLoggedIn() always returns true */}
                {user.isLoggedIn() && false ? (
                    <>
                        <Stack.Screen name="test" component={TestScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="home" options={{ headerShown: false }} component={HomeScreen} />
                        <Stack.Screen
                            name="securitySplash"
                            options={{ headerShown: false }}
                            component={SplashSecurityScreen}
                        />
                        <Stack.Screen
                            name="privacySplash"
                            options={{ headerShown: false }}
                            component={SplashPrivacyScreen}
                        />
                        <Stack.Screen
                            name="transparencySplash"
                            options={{ headerShown: false }}
                            component={SplashTransparencyScreen}
                        />
                        <Stack.Screen
                            name="createAccountUsername"
                            options={{ title: 'Create New Account' }}
                            component={CreateAccountUsernameScreen}
                        />
                        <Stack.Screen name="createAccountPassword" component={CreateAccountPasswordScreen} />
                        <Stack.Screen name="fingerprint" component={FingerprintUpdateScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

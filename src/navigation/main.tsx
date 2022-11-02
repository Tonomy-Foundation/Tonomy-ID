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

const Stack = createNativeStackNavigator();

export default function MainNavigation() {
    const user = useUserStore();
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="securitySplash">
                {/* TODO: fix user.isLoggedIn() always returns true */}
                {user.isLoggedIn() && false ? (
                    <>
                        <Stack.Screen name="test" component={TestScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="home" component={HomeScreen} />
                        <Stack.Screen name="securitySplash" component={SplashSecurityScreen} />
                        <Stack.Screen name="privacySplash" component={SplashPrivacyScreen} />
                        <Stack.Screen name="transparencySplash" component={SplashTransparencyScreen} />
                        <Stack.Screen name="createAccountUsername" component={CreateAccountUsernameScreen} />
                        <Stack.Screen name="createAccountPassword" component={CreateAccountPasswordScreen} />
                        <Stack.Screen name="fingerprint" component={FingerprintUpdateScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

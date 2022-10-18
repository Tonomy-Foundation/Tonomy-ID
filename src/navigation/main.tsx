import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../screens/homeScreen';
import TestScreen from '../screens/testScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen';
import SplashSecurityScreen from '../screens/SplashSecurityScreen';
import SplashPrivacyScreen from '../screens/SplashPrivacyScreen';
import SplashTransparencyScreen from '../screens/SplashTransparencyScreen';
import useUserStore from '../store/userStore';

const Stack = createNativeStackNavigator();

export default function MainNavigation() {
    const user = useUserStore();
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="securitySplash">
                {user.isLoggedIn() ? (
                    <>
                        <Stack.Screen name="test" component={TestScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="home" component={HomeScreen} />
                        <Stack.Screen name="securitySplash" component={SplashSecurityScreen} />
                        <Stack.Screen name="privacySplash" component={SplashPrivacyScreen} />
                        <Stack.Screen name="transparencySplash" component={SplashTransparencyScreen} />
                        <Stack.Screen name="createAccount" component={CreateAccountScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

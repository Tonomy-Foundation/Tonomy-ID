import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../screens/homeScreen';
import TestScreen from '../screens/testScreen';
import CreateAccountUsernameScreen from '../screens/CreateAccountUsernameScreen';
import CreateAccountPasswordScreen from '../screens/CreateAccountPasswordScreen';
import MainSplashScreen from '../screens/MainSplashScreen';
import SplashSecurityScreen from '../screens/SplashSecurityScreen';
import SplashPrivacyScreen from '../screens/SplashPrivacyScreen';
import SplashTransparencyScreen from '../screens/SplashTransparencyScreen';
import useUserStore from '../store/userStore';
import FingerprintUpdateScreen from '../screens/FingerprintUpdateScreen';
import PinScreen from '../screens/PinScreen';
import theme, { customColors } from '../utils/theme';

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

const noHeaderScreenOptions = { ...defaultScreenOptions, headerShown: false };

export default function MainNavigation() {
    const user = useUserStore();
    return (
        <NavigationContainer theme={theme}>
            <Stack.Navigator initialRouteName="mainSplash" screenOptions={defaultScreenOptions}>
                {/* TODO: fix user.isLoggedIn() always returns true */}
                {user.isLoggedIn() && false ? (
                    <>
                        <Stack.Screen name="test" component={TestScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="home" options={noHeaderScreenOptions} component={HomeScreen} />
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
                            options={{ ...defaultScreenOptions, title: 'Create New Account' }}
                            component={CreateAccountPasswordScreen}
                        />
                        <Stack.Screen name="fingerprint" component={FingerprintUpdateScreen} />
                        <Stack.Screen name="pin" component={PinScreen} />
                        <Stack.Screen name="test" component={TestScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import PinScreen from '../screens/PinScreen';
import CreateAccountUsernameScreen from '../screens/CreateAccountUsernameScreen';
import CreateAccountPasswordScreen from '../screens/CreateAccountPasswordScreen';
import ConfirmPasswordScreen from '../screens/ConfirmPasswordScreen';
import MainSplashScreen from '../screens/MainSplashScreen';
import SplashSecurityScreen from '../screens/SplashSecurityScreen';
import SplashPrivacyScreen from '../screens/SplashPrivacyScreen';
import SplashTransparencyScreen from '../screens/SplashTransparencyScreen';
import useUserStore, { UserStatus } from '../store/userStore';
import FingerprintUpdateScreen from '../screens/FingerprintUpdateScreen';
import DrawerNavigation from './Drawer';
import settings from '../settings';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import merge from 'deepmerge';
import * as Linking from 'expo-linking';
import SSOLoginScreen from '../screens/SSOLoginScreen';
import LoginUsernameScreen from '../screens/LoginUsernameScreen';
import LoginPasswordScreen from '../screens/LoginPasswordScreen';
import LoginPinScreen from '../screens/LoginPinScreen';
import { useAppTheme } from '../utils/theme';
import CommunicationModule from '../services/CommunicationModule';
import NotificationModule from '../services/NotificationModule';
import ConfirmPassphraseScreen from '../screens/ConfirmPassphraseScreen';
import CreatePassphraseScreen from '../screens/CreatePassphraseScreen';

const prefix = Linking.createURL('');

export type RouteStackParamList = {
    Splash: undefined;
    SplashSecurity: undefined;
    SplashPrivacy: undefined;
    SplashTransparency: undefined;
    Home: undefined;
    CreateAccountUsername: undefined;
    CreateAccountPassword: undefined;
    CreatePassphrase: undefined;
    CreateAccountPin: { password: string; action: string };
    LoginWithPin: { password: string };
    CreateAccountFingerprint: { password: string };
    LoginUsername: undefined;
    LoginPassword: { username: string };
    UserHome: { did?: string };
    Test: undefined;
    Drawer: undefined;
    SetPassword: undefined;
    Settings: undefined;
    QrScanner: undefined;
    SSO: { payload: string; platform?: 'mobile' | 'browser' };
    ConfirmPassword: undefined;
    ConfirmPassphrase: undefined;
};

const Stack = createNativeStackNavigator<RouteStackParamList>();

export default function RootNavigation() {
    const linking = {
        prefixes: [prefix],
    };

    // Setup styles
    const theme = useAppTheme();
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
            backgroundColor: theme.colors.headerFooter,
        },
        headerTitleStyle: {
            fontSize: 24,
            color: theme.colors.text,
        },
        headerTitleAlign: 'center',
        headerTintColor: theme.dark ? theme.colors.text : 'black',
    };

    const noHeaderScreenOptions = { headerShown: false };
    const CombinedDefaultTheme = merge(navigationTheme, theme);

    const user = useUserStore();

    return (
        <NavigationContainer theme={CombinedDefaultTheme} linking={linking}>
            {user.status === UserStatus.NONE || user.status === UserStatus.NOT_LOGGED_IN ? (
                <Stack.Navigator initialRouteName={'Splash'} screenOptions={defaultScreenOptions}>
                    <Stack.Screen name="Splash" options={noHeaderScreenOptions} component={MainSplashScreen} />
                    <Stack.Screen
                        name="SplashSecurity"
                        options={noHeaderScreenOptions}
                        component={SplashSecurityScreen}
                    />
                    <Stack.Screen
                        name="SplashPrivacy"
                        options={noHeaderScreenOptions}
                        component={SplashPrivacyScreen}
                    />
                    <Stack.Screen
                        name="SplashTransparency"
                        options={noHeaderScreenOptions}
                        component={SplashTransparencyScreen}
                    />
                    <Stack.Screen name="Home" options={noHeaderScreenOptions} component={HomeScreen} />
                    <Stack.Screen
                        name="CreateAccountUsername"
                        options={{ title: 'Create New Account' }}
                        component={CreateAccountUsernameScreen}
                    />
                    <Stack.Screen
                        name="CreatePassphrase"
                        options={{ title: 'Create New Account' }}
                        component={CreatePassphraseScreen}
                    />
                    <Stack.Screen
                        name="CreateAccountPassword"
                        options={{ title: 'Create New Account' }}
                        component={CreateAccountPasswordScreen}
                    />
                    <Stack.Screen
                        name="ConfirmPassphrase"
                        options={{ title: 'Create New Account' }}
                        component={ConfirmPassphraseScreen}
                    />
                    <Stack.Screen
                        name="ConfirmPassword"
                        options={{ title: 'Confirm Password' }}
                        component={ConfirmPasswordScreen}
                    />
                    <Stack.Screen name="CreateAccountPin" options={{ title: 'PIN' }} component={PinScreen} />
                    <Stack.Screen
                        name="CreateAccountFingerprint"
                        options={{ title: 'Fingerprint Registration' }}
                        component={FingerprintUpdateScreen}
                        initialParams={{ password: '' }}
                    />
                    <Stack.Screen name="LoginUsername" options={{ title: 'Login' }} component={LoginUsernameScreen} />
                    <Stack.Screen name="LoginPassword" options={{ title: 'Login' }} component={LoginPasswordScreen} />
                    <Stack.Screen name="LoginWithPin" options={{ title: 'PIN' }} component={LoginPinScreen} />
                </Stack.Navigator>
            ) : (
                <>
                    <NotificationModule />
                    <CommunicationModule />
                    <Stack.Navigator initialRouteName={'UserHome'} screenOptions={defaultScreenOptions}>
                        <Stack.Screen
                            name="Drawer"
                            component={DrawerNavigation}
                            options={{ headerShown: false, title: settings.config.appName }}
                        />
                        <Stack.Screen
                            name="SSO"
                            options={{ ...noHeaderScreenOptions, title: settings.config.appName }}
                            component={SSOLoginScreen}
                        />
                    </Stack.Navigator>
                </>
            )}
        </NavigationContainer>
    );
}

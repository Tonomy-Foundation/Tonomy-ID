import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import PinScreen from '../screens/PinScreen';
import CreateAccountUsernameScreen from '../screens/CreateAccountUsernameScreen';
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
import LoginPinScreen from '../screens/LoginPinScreen';
import { useAppTheme } from '../utils/theme';
import CommunicationModule from '../services/CommunicationModule';
import NotificationModule from '../services/NotificationModule';
import CreatePassphraseScreen from '../screens/CreatePassphraseScreen';
import HcaptchaScreen from '../screens/HcaptchaScreen';
import LoginPassphraseScreen from '../screens/LoginPassphraseScreen';
import ConfirmPassphraseScreen from '../screens/ConfirmPassphraseScreen';
import TermsAndConditionScreen from '../screens/TermsAndConditionScreen';
import PrivacyAndPolicyScreen from '../screens/PrivacyAndPolicyScreen';
import ProfilePreviewScreen from '../screens/ProfilePreviewScreen';
import SignTransactionConsentScreen from '../screens/SignTransactionConsentScreen';

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
    CreateAccountFingerprint: { password: string };
    Hcaptcha: undefined;
    LoginWithPin: { password: string };
    LoginUsername: undefined;
    LoginPassphrase: { username: string };
    UserHome: { did?: string };
    Drawer: undefined;
    SetPassword: undefined;
    Settings: undefined;
    QrScanner: undefined;
    SSO: { payload: string; platform?: 'mobile' | 'browser' };
    ConfirmPassword: undefined;
    ConfirmPassphrase: { index: number };
    TermsAndCondition: undefined;
    PrivacyAndPolicy: undefined;
    ProfilePreview: undefined;
    SignTransaction: undefined;
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
                    <Stack.Screen
                        name="TermsAndCondition"
                        options={{ headerBackTitleVisible: false, title: 'Terms and Conditions' }}
                        component={TermsAndConditionScreen}
                    />
                    <Stack.Screen
                        name="PrivacyAndPolicy"
                        options={{ headerBackTitleVisible: false, title: 'Terms and Conditions' }}
                        component={PrivacyAndPolicyScreen}
                    />
                    <Stack.Screen name="Home" options={noHeaderScreenOptions} component={HomeScreen} />
                    <Stack.Screen
                        name="CreateAccountUsername"
                        options={{ headerBackTitleVisible: false, title: 'Create New Account' }}
                        component={CreateAccountUsernameScreen}
                    />
                    <Stack.Screen
                        name="CreatePassphrase"
                        options={{ headerBackTitleVisible: false, title: 'Create New Account' }}
                        component={CreatePassphraseScreen}
                    />
                    <Stack.Screen
                        name="Hcaptcha"
                        options={{ headerBackTitleVisible: false, title: 'Create New Account' }}
                        component={HcaptchaScreen}
                    />
                    <Stack.Screen
                        name="ConfirmPassphrase"
                        options={{ headerBackTitleVisible: false, title: 'Create New Account' }}
                        component={ConfirmPassphraseScreen}
                    />
                    <Stack.Screen name="CreateAccountPin" options={{ title: 'PIN' }} component={PinScreen} />
                    <Stack.Screen
                        name="CreateAccountFingerprint"
                        options={{ title: 'Fingerprint Registration' }}
                        component={FingerprintUpdateScreen}
                        initialParams={{ password: '' }}
                    />
                    <Stack.Screen
                        name="LoginUsername"
                        options={{ headerBackTitleVisible: false, title: 'Login' }}
                        component={LoginUsernameScreen}
                    />
                    <Stack.Screen
                        name="LoginPassphrase"
                        options={{ headerBackTitleVisible: false, title: 'Login' }}
                        component={LoginPassphraseScreen}
                    />
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
                        <Stack.Screen
                            name="ProfilePreview"
                            options={{ headerBackTitleVisible: false, title: 'Profile Information' }}
                            component={ProfilePreviewScreen}
                        />
                        <Stack.Screen
                            name="SignTransaction"
                            options={{ headerBackTitleVisible: false, title: 'Transaction Request' }}
                            component={SignTransactionConsentScreen}
                        />
                    </Stack.Navigator>
                </>
            )}
        </NavigationContainer>
    );
}

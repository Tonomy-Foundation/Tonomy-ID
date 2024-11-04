import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import PinScreen from '../screens/PinScreen';
import CreateAccountUsernameScreen from '../screens/CreateAccountUsernameScreen';
import MainSplashScreen from '../screens/MainSplashScreen';
import useUserStore, { UserStatus } from '../store/userStore';
import FingerprintUpdateScreen from '../screens/FingerprintUpdateScreen';
import DrawerNavigation from './Drawer';
import settings from '../settings';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import merge from 'deepmerge';
import { SignClientTypes } from '@walletconnect/types';
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
import SignTransactionConsentSuccessScreen from '../screens/SignTransactionConsentSuccessScreen';
import WalletConnectLoginScreen from '../screens/WalletConnectLoginScreen';
import CreateEthereumKeyScreen from '../screens/CreateEthereumKeyScreen';
import ReceiveScreen from '../screens/ReceiveAssetScreen';
import SendScreen from '../screens/SendAssetScreen';
import {
    IChain,
    ILoginRequest,
    IPrivateKey,
    ITransaction,
    ITransactionReceipt,
    ITransactionRequest,
} from '../utils/chain/types';
import { ResolvedSigningRequest } from '@wharfkit/signing-request';
import { Web3WalletTypes } from '@walletconnect/web3wallet';
import Debug from 'debug';
import { OperationData } from '../components/Transaction';
import AssetDetail from '../screens/AssetDetailScreen';
import SelectAsset from '../screens/SelectAssetScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AppInstructionModal from '../components/AppInstructionModal';
import { navigationRef } from '../services/NavigationService';

const debug = Debug('tonomy-id:navigation:root');

const prefix = Linking.createURL('');

export interface AssetsParamsScreen {
    screenTitle?: string;
    chain: IChain;
}

export type MainRouteStackParamList = {
    Splash: undefined;
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
    Drawer: undefined;
    SetPassword: undefined;
    Settings: undefined;
    Support: undefined;
    SSO: { payload: string; platform?: 'mobile' | 'browser' };
    ConfirmPassword: undefined;
    ConfirmPassphrase: { index: number };
    TermsAndCondition: undefined;
    PrivacyAndPolicy: undefined;
    ProfilePreview: undefined;
    SignTransaction: {
        transaction: ITransactionRequest;
    };
    SignTransactionSuccess: {
        operations: OperationData[];
        transaction: ITransaction;
        receipt: ITransactionReceipt;
    };
    WalletConnectLogin: {
        loginRequest: ILoginRequest;
    };
    CreateEthereumKey?: {
        transaction?: ITransactionRequest;
        requestType?: string;
    };
    BottomTabs: undefined;

    Assets: undefined;
    AssetListing: {
        screen: string;
        params?: {
            did?: string;
            type: string;
            screenTitle: string;
        };
    };
    Onboarding: undefined;
    Citizenship: undefined;
    Explore: undefined;
    Apps: undefined;
    AssetDetail: AssetsParamsScreen;
    Receive: AssetsParamsScreen;
    Send: {
        screenTitle?: string;
        chain: IChain;
        privateKey: IPrivateKey;
    };
    SelectAsset: { screenTitle?: string; type: string };
};

export type BottonNavigatorRouteStackParamList = {
    Citizenship: undefined;
    Assets: undefined;
    Explore: undefined;
    Apps: undefined;
    ScanQR: { did?: string };
};

export type RouteStackParamList = MainRouteStackParamList & BottonNavigatorRouteStackParamList;

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
            fontSize: 16,
            fontWeight: '500',
            color: theme.colors.text,
        },
        headerTitleAlign: 'center',
        headerTintColor: theme.dark ? theme.colors.text : 'black',
    };

    const noHeaderScreenOptions = { headerShown: false };
    const CombinedDefaultTheme = merge(navigationTheme, theme);

    const { status } = useUserStore();

    return (
        <NavigationContainer ref={navigationRef} theme={CombinedDefaultTheme} linking={linking}>
            {status === UserStatus.NONE || status === UserStatus.NOT_LOGGED_IN ? (
                <Stack.Navigator initialRouteName={'Splash'} screenOptions={defaultScreenOptions}>
                    <Stack.Screen name="Splash" options={noHeaderScreenOptions} component={MainSplashScreen} />
                    <Stack.Screen name="Onboarding" options={noHeaderScreenOptions} component={OnboardingScreen} />

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
                    <AppInstructionModal />
                    <Stack.Navigator initialRouteName={'BottomTabs'} screenOptions={defaultScreenOptions}>
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
                        <Stack.Screen
                            name="SignTransactionSuccess"
                            options={{
                                headerBackTitleVisible: false,
                                title: 'Transfer',
                                headerBackVisible: false,
                            }}
                            component={SignTransactionConsentSuccessScreen}
                        />
                        <Stack.Screen
                            name="WalletConnectLogin"
                            options={{ ...noHeaderScreenOptions, title: settings.config.appName }}
                            component={WalletConnectLoginScreen}
                        />
                        <Stack.Screen
                            name="CreateEthereumKey"
                            options={{ headerBackTitleVisible: false, title: 'Generate key' }}
                            component={CreateEthereumKeyScreen}
                            initialParams={{}}
                        />
                        <Stack.Screen
                            name="AssetDetail"
                            options={({ route }) => ({
                                headerBackTitleVisible: false,
                                title: route.params?.screenTitle || 'AssetDetail',
                            })}
                            component={AssetDetail}
                        />
                        <Stack.Screen
                            name="Send"
                            options={({ route }) => ({
                                headerBackTitleVisible: false,
                                title: route.params?.screenTitle || 'Send',
                            })}
                            component={SendScreen}
                        />
                        <Stack.Screen
                            name="Receive"
                            options={({ route }) => ({
                                headerBackTitleVisible: false,
                                title: route.params?.screenTitle || 'Receive',
                            })}
                            component={ReceiveScreen}
                        />
                        <Stack.Screen
                            name="SelectAsset"
                            options={({ route }) => ({
                                headerBackTitleVisible: false,
                                title: route.params?.screenTitle || 'Select Asset',
                            })}
                            component={SelectAsset}
                        />
                    </Stack.Navigator>
                </>
            )}
        </NavigationContainer>
    );
}

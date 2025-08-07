import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import CreateAccountUsernameScreen from '../screens/CreateAccountUsernameScreen';
import MainSplashScreen from '../screens/MainSplashScreen';
import useUserStore, { UserStatus } from '../store/userStore';
import DrawerNavigation from './Drawer';
import settings from '../settings';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import merge from 'deepmerge';
import { SignClientTypes } from '@walletconnect/types';
import * as Linking from 'expo-linking';
import SSOLoginScreen from '../screens/SSOLoginScreen';
import LoginUsernameScreen from '../screens/LoginUsernameScreen';
import { useAppTheme } from '../utils/theme';
import CommunicationProvider from '../providers/Communication';
import NotificationsProvider from '../providers/Notifications';
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
import { OperationData } from '../components/Transaction';
import SelectAsset from '../screens/SelectAssetScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AssetManagerScreen from '../screens/AssetManagerScreen';
import VestedAssetsScreen from '../screens/VestedAssetsScreen';
import { navigationRef } from '../utils/navigate';
import ConfirmStakingScreen from '../screens/ConfirmStakingScreen';
import StakeAssetScreen from '../screens/StakeAssetScreen';
import StakeAssetDetailScreen from '../screens/StakeAssetDetailScreen';
import SuccessUnstakeScreen from '../screens/SuccessUnstakeScreen';
import WithdrawVestedScreen from '../screens/WithdrawVestedScreen';
import VestedSuccessScreen from '../screens/VestedSuccessScreen';
import ConfirmUnstakingScreen from '../screens/ConfirmUnstakingScreen';
import VeriffLoginScreen from '../screens/VeriffLoginScreen';
import VeriffDataSharingScreen from '../screens/VeriffDataSharingScreen';
import { KYCPayload } from '@tonomy/tonomy-id-sdk';
import KycOnboardingScreen from '../screens/KycOnboardingScreen';

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
    Hcaptcha: undefined;
    LoginUsername: undefined;
    LoginPassphrase: { username: string };
    Drawer: undefined;
    SetPassword: undefined;
    Settings: undefined;
    Support: undefined;
    SSO: { payload: string; receivedVia?: 'deepLink' | 'message' };
    ConfirmPassword: undefined;
    ConfirmPassphrase: { index: number };
    TermsAndCondition: undefined;
    PrivacyAndPolicy: undefined;
    ProfilePreview: undefined;
    SignTransaction: {
        request: ITransactionRequest;
    };
    SignTransactionSuccess: {
        operations: OperationData[];
        transaction?: ITransaction;
        receipt: ITransactionReceipt;
        request: ITransactionRequest;
    };
    WalletConnectLogin: {
        loginRequest: ILoginRequest;
    };
    CreateEthereumKey: {
        transaction?: ITransactionRequest | null;
        requestType: string;
        request:
            | SignClientTypes.EventArguments['session_request']
            | SignClientTypes.EventArguments['session_proposal']
            | null;
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
    Receive: AssetsParamsScreen;
    Send: {
        screenTitle?: string;
        chain: IChain;
        privateKey: IPrivateKey;
    };
    SelectAsset: { screenTitle?: string; type: string };
    AssetManager: AssetsParamsScreen;
    VestedAssets: AssetsParamsScreen;
    ConfirmStaking: AssetsParamsScreen & { amount: number; withDraw?: boolean };
    StakeAsset: AssetsParamsScreen;
    StakeAssetDetail: AssetsParamsScreen & { loading?: boolean };
    SuccessUnstake: AssetsParamsScreen;
    WithdrawVested: AssetsParamsScreen & { amount: number; total: number };
    SuccessVested: AssetsParamsScreen;
    ConfirmUnStaking: AssetsParamsScreen & { amount: number; allocationId: number };
    VeriffLogin: undefined;
    VeriffDataSharing: { payload: KYCPayload };
    KycOnboarding: undefined;
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
                </Stack.Navigator>
            ) : (
                <>
                    <NotificationsProvider />
                    <CommunicationProvider />
                    <Stack.Navigator initialRouteName={'BottomTabs'} screenOptions={defaultScreenOptions}>
                        <Stack.Screen
                            name="Drawer"
                            component={DrawerNavigation}
                            options={{ headerShown: false, title: settings.config.appName }}
                        />
                        <Stack.Screen
                            name="SSO"
                            options={{ headerBackTitleVisible: false, headerBackVisible: false, title: 'App login' }}
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
                            name="AssetManager"
                            options={({ route }) => ({
                                headerBackTitleVisible: false,
                                title: route.params?.screenTitle || 'AssetDetail',
                            })}
                            component={AssetManagerScreen}
                        />
                        <Stack.Screen
                            name="VestedAssets"
                            options={{ headerBackTitleVisible: false, title: 'Vested assets' }}
                            component={VestedAssetsScreen}
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

                        <Stack.Screen
                            name="StakeAssetDetail"
                            options={{
                                headerBackTitleVisible: false,
                                title: `Stake ${settings.config.currencySymbol}`,
                            }}
                            component={StakeAssetDetailScreen}
                        />
                        <Stack.Screen
                            name="StakeAsset"
                            options={{
                                headerBackTitleVisible: false,
                                title: `Stake ${settings.config.currencySymbol}`,
                            }}
                            component={StakeAssetScreen}
                        />
                        <Stack.Screen
                            name="ConfirmStaking"
                            options={{ headerBackTitleVisible: false, title: 'Confirm staking' }}
                            component={ConfirmStakingScreen}
                        />

                        <Stack.Screen
                            name="SuccessUnstake"
                            options={{ headerBackTitleVisible: false, headerBackVisible: false, title: 'Success' }}
                            component={SuccessUnstakeScreen}
                        />
                        <Stack.Screen
                            name="WithdrawVested"
                            options={{ headerBackTitleVisible: false, title: 'Withdraw' }}
                            component={WithdrawVestedScreen}
                        />
                        <Stack.Screen
                            name="SuccessVested"
                            options={{ headerBackTitleVisible: false, headerBackVisible: false, title: 'Success' }}
                            component={VestedSuccessScreen}
                        />
                        <Stack.Screen
                            name="ConfirmUnStaking"
                            options={{ headerBackTitleVisible: false, title: 'Confirm unstaking' }}
                            component={ConfirmUnstakingScreen}
                        />
                        <Stack.Screen
                            name="VeriffLogin"
                            options={{ headerBackTitleVisible: false, title: 'App Login' }}
                            component={VeriffLoginScreen}
                        />
                        <Stack.Screen
                            name="VeriffDataSharing"
                            options={{ headerBackTitleVisible: false, headerBackVisible: false, title: 'Data Sharing' }}
                            component={VeriffDataSharingScreen}
                        />
                        <Stack.Screen
                            name="KycOnboarding"
                            options={{ headerShown: false, headerBackTitleVisible: false, title: 'KYC Onboarding' }}
                            component={KycOnboardingScreen}
                        />
                    </Stack.Navigator>
                </>
            )}
        </NavigationContainer>
    );
}

import React from 'react';
import { createDrawerNavigator, DrawerNavigationOptions } from '@react-navigation/drawer';
import CustomDrawer from '../components/CustomDrawer';
// import MainScreen from '../screens/MainScreen';
import SettingsNavigation from './Settings';
import { useAppTheme } from '../utils/theme';
import { SignClientTypes } from '@walletconnect/types';
import { IPrivateKey, ITransaction, IChainSession } from '../utils/chain/types';
import BottomTabNavigator from './BottomTabNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import { TouchableOpacity } from 'react-native';
import MenuIcon from '../assets/icons/MenuIcon';
import SupportScreen from '../screens/SupportScreen';
import { ResolvedSigningRequest } from '@wharfkit/signing-request';
import { Web3WalletTypes } from '@walletconnect/web3wallet';

export type DrawerStackParamList = {
    UserHome: { did?: string };
    Settings: undefined;
    Support: undefined;
    Help: undefined;
    Logout: undefined;
    ChangePin: undefined;
    SSO: { payload: string; platform: 'mobile' | 'browser' };
    SignTransaction: {
        transaction: ITransaction;
        privateKey: IPrivateKey;
        origin: string;
        request: Web3WalletTypes.SessionRequest | ResolvedSigningRequest;
        session: IChainSession;
    };
    WalletConnectLogin: {
        payload: SignClientTypes.EventArguments['session_proposal'];
        platform: 'mobile' | 'browser';
        session: IChainSession;
    };
    CreateEthereumKey?: {
        transaction?: ITransaction;
        payload?: Web3WalletTypes.SessionRequest | SignClientTypes.EventArguments['session_proposal'];
        requestType?: string;
        session?: IChainSession;
    };
    BottomTabs: undefined;
};

const Drawer = createDrawerNavigator<DrawerStackParamList>();

export default function DrawerNavigation() {
    const theme = useAppTheme();
    const defaultScreenOptions: DrawerNavigationOptions = {
        headerTitleStyle: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.colors.text,
        },
        headerTitleAlign: 'center',
        headerTintColor: theme.dark ? theme.colors.text : 'black',
    };

    const drawerScreenOptions = ({ navigation }) => ({
        headerLeft: () => (
            <TouchableOpacity
                style={{ paddingHorizontal: 15, paddingVertical: 10 }}
                onPress={() => navigation.toggleDrawer()}
            >
                <MenuIcon />
            </TouchableOpacity>
        ),
    });

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawer {...props} />}
            initialRouteName="BottomTabs"
            screenOptions={defaultScreenOptions}
        >
            <Drawer.Screen name="BottomTabs" options={{ headerShown: false }} component={BottomTabNavigator} />
            {/* change component to Main Navigation when bottom nav should be added */}
            {/* <Drawer.Screen name="UserHome" options={{ title: 'Home' }} component={MainScreen} /> */}

            <Drawer.Screen name="Settings" options={drawerScreenOptions} component={SettingsScreen} />
            <Drawer.Screen name="Support" options={drawerScreenOptions} component={SupportScreen} />
        </Drawer.Navigator>
    );
}

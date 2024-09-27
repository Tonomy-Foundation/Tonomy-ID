import ReceiveScreen from '../screens/Receive';
import SendScreen from '../screens/Send';
import SelectAssetScreen from '../screens/SelectAsset';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import theme from '../utils/theme';
import { AssetParamsScreen } from './Root';
import { IPrivateKey, ISession, ITransaction } from '../utils/chain/types';
import { ArrowLeft } from 'iconoir-react-native';

export type SelectAssetsStackParamList = {
    SelectAsset: { did?: string; screenTitle?: string; type: string };
    Receive: AssetParamsScreen;
    Send: AssetParamsScreen;
    SignTransaction?: {
        transaction: ITransaction;
        privateKey: IPrivateKey;
        session: ISession | null;
    };
};
const SelectAssetStack = createNativeStackNavigator<SelectAssetsStackParamList>();
export const SelectAssetNavigator = () => {
    const defaultScreenOptions: NativeStackNavigationOptions = {
        headerTitleStyle: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.colors.text,
        },
        headerTitleAlign: 'center',
        headerTintColor: theme.dark ? theme.colors.text : 'black',
    };
    return (
        <SelectAssetStack.Navigator screenOptions={defaultScreenOptions} initialRouteName="SelectAsset">
            <SelectAssetStack.Screen
                name="SelectAsset"
                options={({ route, navigation }) => ({
                    headerTitle: route.params?.screenTitle || 'Select Asset',
                    headerLeft: () => (
                        <TouchableOpacity
                            style={{ paddingHorizontal: 5, paddingVertical: 10 }}
                            onPress={() => navigation.goBack()}
                        >
                            <ArrowLeft height={24} width={24} color={theme.colors.black} />
                        </TouchableOpacity>
                    ),
                })}
                component={SelectAssetScreen}
            />
            <SelectAssetStack.Screen
                name="Receive"
                options={({ route, navigation }) => ({
                    headerTitle: route.params?.screenTitle || 'Receive',
                    headerLeft: () => (
                        <TouchableOpacity
                            style={{ paddingHorizontal: 5, paddingVertical: 10 }}
                            onPress={() => navigation.goBack()}
                        >
                            <ArrowLeft height={24} width={24} color={theme.colors.black} />
                        </TouchableOpacity>
                    ),
                })}
                component={ReceiveScreen}
            />
            <SelectAssetStack.Screen
                name="Send"
                options={({ route, navigation }) => ({
                    headerTitle: route.params?.screenTitle || 'Send',
                    headerLeft: () => (
                        <TouchableOpacity
                            style={{ paddingHorizontal: 5, paddingVertical: 10 }}
                            onPress={() => navigation.goBack()}
                        >
                            <ArrowLeft height={24} width={24} color={theme.colors.black} />
                        </TouchableOpacity>
                    ),
                })}
                component={SendScreen}
            />
        </SelectAssetStack.Navigator>
    );
};

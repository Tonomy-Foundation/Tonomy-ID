import ReceiveScreen from '../screens/Receive';
import SendScreen from '../screens/Send';
import SelectAssetScreen from '../screens/SelectAsset';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import theme from '../utils/theme';
import ArrowBackIcon from '../assets/icons/ArrowBackIcon';
import { AssetParamsScreen } from './Root';

export type SelectAssetsStackParamList = {
    SelectAsset: { did?: string; screenTitle?: string; type: string };
    Receive: AssetParamsScreen;
    Send: AssetParamsScreen;
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
                            <ArrowBackIcon />
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
                            <ArrowBackIcon />
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
                            <ArrowBackIcon />
                        </TouchableOpacity>
                    ),
                })}
                component={SendScreen}
            />
        </SelectAssetStack.Navigator>
    );
};

import { TouchableOpacity } from 'react-native';
import AssetDetail from '../screens/AssetDetail';
import ReceiveScreen from '../screens/Receive';
import SendScreen from '../screens/Send';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import theme from '../utils/theme';
import { AssetsParamsScreen } from './Root';
import { ArrowLeft } from 'iconoir-react-native';

export type AssetDetailStackParamList = {
    AssetDetail: AssetsParamsScreen;
    Receive: AssetsParamsScreen;
    Send: AssetsParamsScreen;
};

const AssetDetailStack = createNativeStackNavigator<AssetDetailStackParamList>();

export const AssetDetailNavigator = () => {
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
        <AssetDetailStack.Navigator screenOptions={defaultScreenOptions}>
            <AssetDetailStack.Screen
                name="AssetDetail"
                options={({ route, navigation }) => ({
                    headerTitle: route.params?.screenTitle || 'Asset Detail',
                    headerLeft: () => (
                        <TouchableOpacity
                            style={{ paddingHorizontal: 5, paddingVertical: 10 }}
                            onPress={() => navigation.goBack()}
                        >
                            <ArrowLeft height={24} width={24} color={theme.colors.black} />
                        </TouchableOpacity>
                    ),
                })}
                component={AssetDetail}
            />
            <AssetDetailStack.Screen
                name="Receive"
                options={({ route, navigation }) => {
                    return {
                        headerTitle: route.params?.screenTitle || 'Receive',
                        headerLeft: () => (
                            <TouchableOpacity
                                style={{ paddingHorizontal: 5, paddingVertical: 10 }}
                                onPress={() => navigation.goBack()}
                            >
                                <ArrowLeft height={24} width={24} color={theme.colors.black} />
                            </TouchableOpacity>
                        ),
                    };
                }}
                component={ReceiveScreen}
            />
            <AssetDetailStack.Screen
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
        </AssetDetailStack.Navigator>
    );
};

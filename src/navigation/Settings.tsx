import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IconButton, useTheme } from 'react-native-paper';
import SettingsScreen from '../screens/SettingsScreen';
import { TouchableOpacity, StyleSheet } from 'react-native';
import PinSettingsScreen from '../screens/PinSettingsScreen';
import FaceIdSettingsScreen from '../screens/FaceIdSettingsScreen';
import FingerprintSettingsScreen from '../screens/FingerprintSettingsScreen';
// import PinScreen from '../screens/PinScreen';

export type SettingsStackParamList = {
    Splash: undefined;
    Settings: undefined;
    ChangePassword: undefined;
    ConfirmPassword: undefined;
    SetPassword: undefined;
    PinSettings: undefined;
    FaceIdSettings: undefined;
    FingerprintUpdate: { password: string };
    FingerprintSettings: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsNavigation() {
    // Setup styles
    const theme = useTheme();

    const navigation = useNavigation();
    const backButton = () => {
        return (
            // @ts-expect-error no overload matches this call
            // TODO fix type error
            <TouchableOpacity onPress={() => navigation.navigate('Assets')}>
                <IconButton
                    icon={Platform.OS === 'android' ? 'arrow-left' : 'chevron-left'}
                    size={Platform.OS === 'android' ? 26 : 38}
                    color="black"
                    style={Platform.OS === 'android' ? styles.androidIcon : styles.iosIcon}
                />
            </TouchableOpacity>
        );
    };
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
        <Stack.Navigator initialRouteName={'Splash'} screenOptions={defaultScreenOptions}>
            <Stack.Screen
                name="Settings"
                options={{ title: 'Settings', headerLeft: backButton, headerBackButtonMenuEnabled: true }}
                component={SettingsScreen}
            />
            <Stack.Screen name="PinSettings" options={{ title: 'Pin Settings' }} component={PinSettingsScreen} />
            <Stack.Screen name="FaceIdSettings" options={{ title: 'Face ID' }} component={FaceIdSettingsScreen} />
            <Stack.Screen
                name="FingerprintSettings"
                options={{ title: 'Fingerprint' }}
                component={FingerprintSettingsScreen}
            />
            {/* <Stack.Screen name="ChangePin" options={{ title: 'Change Pin' }} component={PinScreen} />
            <Stack.Screen name="AddPin" options={{ title: 'Add Pin' }} component={PinScreen} /> */}
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    iosIcon: {
        paddingBottom: 10,
        marginLeft: -30,
        marginTop: -2,
    },
    androidIcon: {
        paddingBottom: 10,
        marginLeft: -4,
        marginBottom: -10,
    },
});

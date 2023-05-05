import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { IconButton, useTheme } from 'react-native-paper';

import SettingsScreen from '../screens/SettingsScreen';
import { TouchableOpacity, StyleSheet } from 'react-native';
import ConfirmPasswordScreen from '../screens/ConfirmPasswordScreen';
import SetPasswordScreen from '../screens/SetPasswordScreen';
import PinSettingsScreen from '../screens/PinSettingsScreen';
import FaceIdSettingsScreen from '../screens/FaceIdSettingsScreen';
import FingerprintSettingsScreen from '../screens/FingerprintSettingsScreen';
import PinScreen from '../screens/PinScreen';

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
    ChangePin: { action: string };
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsNavigation() {
    // Setup styles
    const theme = useTheme();

    const navigation = useNavigation();
    const backButton = () => {
        return (
            <TouchableOpacity onPress={() => navigation.navigate('UserHome')}>
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
        headerShown: true,
        headerBackTitleVisible: false,
        headerStyle: {
            // backgroundColor: theme.colors.,
            backgroundColor: '#F9F9F9',
        },
        headerTitleStyle: {
            fontSize: 24,
            color: '#474D4C',
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
            <Stack.Screen
                name="ConfirmPassword"
                options={{ title: 'Confirm Password ' }}
                component={ConfirmPasswordScreen}
            />
            <Stack.Screen name="SetPassword" options={{ title: 'Set Password' }} component={SetPasswordScreen} />
            <Stack.Screen name="PinSettings" options={{ title: 'Pin Settings' }} component={PinSettingsScreen} />
            <Stack.Screen name="FaceIdSettings" options={{ title: 'Face ID' }} component={FaceIdSettingsScreen} />
            <Stack.Screen
                name="FingerprintSettings"
                options={{ title: 'Fingerprint' }}
                component={FingerprintSettingsScreen}
            />
            <Stack.Screen name="ChangePin" options={{ title: 'Change Pin' }} component={PinScreen} />
            <Stack.Screen name="AddPin" options={{ title: 'Add Pin' }} component={PinScreen} />
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

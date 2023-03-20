import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { IconButton, useTheme } from 'react-native-paper';

import { TouchableOpacity, StyleSheet } from 'react-native';
import PinScreen from '../screens/PinScreen';
import PinSettingsScreen from '../screens/PinSettingsScreen';

export type RouteStackParamList = {
    PinSettings: undefined;
};

const Stack = createNativeStackNavigator<RouteStackParamList>();

export default function SettingsNavigation() {
    // Setup styles
    const theme = useTheme();

    const navigation = useNavigation();
    const backButton = () => {
        return (
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
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
            color: 'black',
        },
        headerTitleAlign: 'center',
        headerTintColor: theme.dark ? theme.colors.text : 'black',
    };

    return (
        <Stack.Navigator initialRouteName={'PinSettings'} screenOptions={defaultScreenOptions}>
            <Stack.Screen
                name="PinSettings"
                options={{ title: 'Settings', headerLeft: backButton, headerBackButtonMenuEnabled: true }}
                component={PinSettingsScreen}
            />
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

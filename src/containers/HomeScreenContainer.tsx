import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import TButton from '../components/Tbutton';
import { NavigationProp } from '@react-navigation/native';

export default function HomeScreenContainer({ navigation }: { navigation: NavigationProp<any> }) {
    return (
        <View>
            <View>
                <TButton mode="contained" onPress={() => navigation.navigate('createAccountUsername')}>
                    Create Account
                </TButton>
                <TButton mode="contained" onPress={() => navigation.navigate('login')}>
                    Login
                </TButton>
            </View>

            <StatusBar style="auto" />
        </View>
    );
}

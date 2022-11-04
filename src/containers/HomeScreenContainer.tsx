import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import TButton from '../components/Tbutton';
import { NavigationProp } from '@react-navigation/native';

export default function HomeScreenContainer({ navigation }: { navigation: NavigationProp<any> }) {
    return (
        <View>
            <View>
                <TButton
                    onPress={() => navigation.navigate('createAccountUsername')}
                    style={{ marginTop: 100, marginBottom: 30 }}
                >
                    Create Account
                </TButton>
                <TButton onPress={() => navigation.navigate('login')}>Login</TButton>
            </View>

            <StatusBar style="auto" />
        </View>
    );
}

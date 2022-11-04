import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import TButton from '../components/Tbutton';
import { NavigationProp } from '@react-navigation/native';
import { Text } from 'react-native-paper';
import useUserStore from 'src/store/userStore';

export default function HomeScreenContainer({ navigation }: { navigation: NavigationProp<any> }) {
    const user = useUserStore((state) => state.user);

    useEffect(() => {
        user.isLoggedIn().then((value) => console.log(value));
    }, []);
    return (
        <View>
            <View>
                <TButton onPress={() => navigation.navigate('createAccount')}>Create Account</TButton>
                <TButton onPress={() => navigation.navigate('login')}>Login</TButton>
            </View>

            <StatusBar style="auto" />
        </View>
    );
}

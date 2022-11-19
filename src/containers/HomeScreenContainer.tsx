import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import TButton from '../components/Tbutton';
import { NavigationProp } from '@react-navigation/native';
import { Text } from 'react-native-paper';
import LayoutComponent from '../components/layout';

export default function HomeScreenContainer({ navigation }: { navigation: NavigationProp<any> }) {
    return (
        <LayoutComponent
            body={
                <View>
                    <Text>Header</Text>
                </View>
            }
            footer={
                <View>
                    <TButton
                        mode="contained"
                        onPress={() => navigation.navigate('createAccountUsername')}
                        style={{ marginBottom: 20 }}
                    >
                        Create Account
                    </TButton>
                    <TButton mode="contained" onPress={() => navigation.navigate('main')}>
                        Login
                    </TButton>
                </View>
            }
        ></LayoutComponent>
    );
}

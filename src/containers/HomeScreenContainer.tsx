import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import TButton from '../components/Tbutton';
import { NavigationProp } from '@react-navigation/native';

export default function HomeScreenContainer({ navigation }: { navigation: NavigationProp<any> }) {
  return (
    <View>

    <View style={HomeButtonStyle.container}>
    <TButton onPress={() => navigation.navigate('home')}>Go to Home</TButton>
    <TButton onPress={() => navigation.navigate('CreateAccountScreen')}>Create Account</TButton>
    <TButton onPress={() => navigation.navigate('#')}>Scan QR</TButton>
    </View>

    <StatusBar style="auto" />
    </View>
  );
}

const HomeButtonStyle = StyleSheet.create({
  container: {
    width: 340,
    height: 50,
    marginTop: 250
  },
});

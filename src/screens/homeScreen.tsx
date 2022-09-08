import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Appbar } from 'react-native-paper';
import TButton from '../components/Tbutton';
import TTextInput from '../components/TTextInput';
import TPasswordInput from '../components/TPasswordInput';
import { NavigationProp } from '@react-navigation/native';

export default function HomeScreen({ navigation }: { navigation: NavigationProp<any> }) {
  return (
    <View>
    <Appbar.Header>
    <Appbar.BackAction onPress={() => { }} />
    <Appbar.Content title="Create Account" />
  </Appbar.Header>

  <View style={styles.container}>
    <View style={TextInputSizing.container}>
      <TTextInput>Username</TTextInput>
      <TPasswordInput>Password</TPasswordInput>
      <TPasswordInput>Confirm Password</TPasswordInput>
    </View>

    <View style={CreateAccountButtonStyle.container}>
      <TButton>Create Account</TButton>
    </View>

    <StatusBar style="auto" />
    </View>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 220,
    marginTop: 50
  },
});
const TextInputSizing = StyleSheet.create({
  container: {
    width: 340,
    height: 50,
  },
});
const CreateAccountButtonStyle = StyleSheet.create({
  container: {
    width: 340,
    height: 50,
    marginTop: 250
  },
});

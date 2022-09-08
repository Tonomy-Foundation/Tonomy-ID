import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Appbar } from 'react-native-paper';
import TButton from './src/components/TButton';
import TTextInput from './src/components/TTextInput';
import TPasswordInput from './src/components/TPasswordInput';
import { autocompleteClasses } from '@mui/material';
import { blue } from '@mui/material/colors';


export default function App() {
  return (
    <PaperProvider>

      <Appbar.Header>
        <Appbar.BackAction onPress={() => { }} />
        <Appbar.Content title="Create Account" />
        <Appbar.Action icon="help" onPress={() => { }} />
      </Appbar.Header>

      <View style={styles.container}>
        <View style={WidthHeight.container}>
          <TTextInput>Username</TTextInput>
          <TPasswordInput>Password</TPasswordInput>
          <TPasswordInput>Confirm Password</TPasswordInput>
        </View>

        <View style={button.container}>
          <TButton>Create Account</TButton>
        </View>

        <StatusBar style="auto" />

      </View>
    </PaperProvider>
  );
}

const colors = {
  TelosColor: {
    Telos: '#2389F3',
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
const WidthHeight = StyleSheet.create({
  container: {
    width: 340,
    height: 50,
    marginBottom: 440,
  },
});
const button = StyleSheet.create({
  container: {
    width: 340,
    height: 50,
    color: colors.TelosColor.Telos
  },
});

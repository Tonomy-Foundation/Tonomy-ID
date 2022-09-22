import TButton from '../components/Tbutton';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import RNKeyManager from '../../utils/RNKeyManager';
import { Checksum256, PrivateKey } from '@greymass/eosio';

export interface IR {
  privateKey: PrivateKey
  salt: Checksum256
}
export default function HomeScreen({ navigation }: { navigation: NavigationProp<any> }) {
  const [r, setR] = useState<IR>();
  const generatePass = () => {
    const rn = new RNKeyManager();
    rn.generatePrivateKeyFromPassword('password').then(result => {
      setR(result);
      console
        .log("test", result)
    }).catch
      (error => console.log(error));

  }
  return (
    <View style={styles.container}>

      <Text>{r?.privateKey.toString() || "test"}</Text>
      <Text>{r?.salt.toString()}</Text>
      <Text>Home page </Text>
      {/* <TButton onPress={() => navigation.navigate('test')}>Go to Testtttt</TButton> */}
      <TButton onPress={() => navigation.navigate('Create Account')}>Go to Create Account</TButton>
      <TButton onPress={generatePass}>create pass</TButton>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
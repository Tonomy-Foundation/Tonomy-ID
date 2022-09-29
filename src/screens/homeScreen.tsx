import TButton from '../components/Tbutton';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import RNKeyManager from '../utils/RNKeyManager';
import { Bytes, Checksum256, PrivateKey } from '@greymass/eosio';
import { encodeHex } from 'tonomy-id-sdk';
import TTextInput from '../components/TTextInput';
import Storage from '../utils/storage';

export interface IR {
  privateKey: PrivateKey
  salt: Checksum256
}
export default function HomeScreen({ navigation }: { navigation: NavigationProp<any> }) {
  let storage: Storage;
  const [r, setR] = useState<IR>();
  const [test, setTest] = useState<string>();

  useEffect(() => {
    storage = new Storage();
    setTest(storage.test);
  }, []);

  const generatePass = () => {
    const rn = new RNKeyManager();
    const hex = encodeHex("12345678901234567890123456789012");
    console.log("hex", hex);

    const salt: Checksum256 = Checksum256.from(Bytes.from(hex, "hex"));

    rn.generatePrivateKeyFromPassword('password', salt).then(result => {
      setR(result);
      console
        .log("test", result)
    }).catch
      (error => console.log(error));

  }

  const saveInStorage = () => {
    storage.test = test;
  }

  return (
    <View style={styles.container}>

      <Text>{r?.privateKey.toString() || "private key"}</Text>
      <Text>Home page </Text>
      <TButton onPress={() => navigation.navigate('test')}>Go to Test</TButton>
      <TButton onPress={() => navigation.navigate('Create Account')}>Go to Create Account</TButton>
      <TTextInput value={test} onChangeText={
        (text) => { setTest(text) }}></TTextInput>
      <TButton onPress={saveInStorage}>save in storage</TButton>
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
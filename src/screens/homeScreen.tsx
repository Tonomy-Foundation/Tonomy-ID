import TButton from '../components/Tbutton';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import React, { useEffect } from 'react';
import RNKeyManager from '../../utils/RNKeyManager';
export default function HomeScreen({ navigation }: { navigation: NavigationProp<any> }) {
  useEffect(() => {
    const rn = new RNKeyManager();

  }, [])
  return (
    <View style={styles.container}>
      <Text>Home page </Text>
      <TButton onPress={() => navigation.navigate('test')}>Go to Test</TButton>
      <TButton onPress={() => navigation.navigate('Create Account')}>Go to Create Account</TButton>

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
import TButton from '../components/Tbutton';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { EthrDID } from 'ethr-did'
import { Issuer } from 'did-jwt-vc'
// import { JwtCredentialPayload, createVerifiableCredentialJwt } from 'did-jwt-vc'

export default function HomeScreen({ navigation }: { navigation: NavigationProp<any> }) {

  useEffect(() => {
    async function main() {
      const issuer = new EthrDID({
        identifier: '0xf1232f840f3ad7d23fcdaa84d6c66dac24efb198',
        privateKey: 'd8b595680851765f38ea5405129244ba3cbad84467d190859f4c8b20c1ff6c75'
      }) as Issuer

      // const vcPayload: JwtCredentialPayload = {
      //   sub: 'did:ethr:0x435df3eda57154cf8cf7926079881f2912f54db4',
      //   nbf: 1562950282,
      //   vc: {
      //     '@context': ['https://www.w3.org/2018/credentials/v1'],
      //     type: ['VerifiableCredential'],
      //     credentialSubject: {
      //       degree: {
      //         type: 'BachelorDegree',
      //         name: 'Baccalauréat en musiques numériques'
      //       }
      //     }
      //   }
      // }

      // const vcJwt = await createVerifiableCredentialJwt(vcPayload, issuer)
      // console.log(vcJwt)
      console.log('hello');
    }

    main();
  }, []);

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
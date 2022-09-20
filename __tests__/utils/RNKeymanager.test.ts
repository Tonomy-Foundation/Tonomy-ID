// import RNKeyManager from "../../utils/RNKeyManager";
import React from 'react';
import renderer from 'react-test-renderer';
import { setGenericPassword } from 'react-native-keychain';
import { Bytes, KeyType, PrivateKey } from "@greymass/eosio";
import { KeyManagerLevel, randomBytes } from "tonomy-id-sdk";
import RNKeyManager from "../../utils/RNKeyManager";
// import * as Keychain from 'react-native-keychain';
import argon2 from 'react-native-argon2';
// const rn = new RNKeyManager();
describe('keychain', () => {
  //   it('can save a key', async () => {
  //     const publicKey = await rn.storeKey({ level: KeyManagerLevel.PASSWORD, privateKey: new PrivateKey(KeyType.K1, new Bytes(randomBytes(32))) })
  //     expect(publicKey).toBeDefined()
  //   })
  it('can save a key', async () => {
    // Keychain.setGenericPassword("test", "test");
    console.log(argon2)
    // argon2("test", "test");
  })

})


describe("RNKeyManager", () => {


});
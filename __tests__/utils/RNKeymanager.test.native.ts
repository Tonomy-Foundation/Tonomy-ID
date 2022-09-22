// import RNKeyManager from "../../utils/RNKeyManager";
import React from 'react';
import renderer from 'react-test-renderer';
import { Bytes, KeyType, PrivateKey } from "@greymass/eosio";
import { KeyManagerLevel, randomBytes } from "tonomy-id-sdk";
import RNKeyManager from "../../utils/RNKeyManager";
import * as argon2 from 'react-native-argon2';
import arg from 'argon2';
jest.mock('react-native-argon2')

describe("RNKeyManager", () => {
  const rn = new RNKeyManager();



  it("can generate a private key from a password", async () => {

    argon2.default.mockImplementation();
    const { privateKey } = await rn.generatePrivateKeyFromPassword("test");
    expect(privateKey).toBeInstanceOf(PrivateKey);
  });

});
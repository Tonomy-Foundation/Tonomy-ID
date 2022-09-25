import { Bytes, Checksum256, KeyType, PrivateKey, PublicKey } from "@greymass/eosio";
import { KeyManagerLevel, randomBytes } from "tonomy-id-sdk";
import RNKeyManager from "../../utils/RNKeyManager";
import * as argon2 from 'react-native-argon2';
import arg from 'argon2';

const mockarg = arg
jest.mock('react-native-argon2', () => {
  return {
    __esModule: true,
    default: jest.fn(async (passowrd: string, salt: Checksum256, options) => {
      return mockarg.hash(passowrd, { raw: true, salt: Buffer.from(salt.toString()), type: mockarg.argon2id, hashLength: 32, timeCost: 2 }).then((hash) => {
        return {
          rawHash: hash.toString('hex'),
          encoded: "aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899"
        }

      })
    })
  }
});


// mock expo secure store
jest.mock('expo-secure-store', () => {
  const storage: any = {};
  return {
    setItemAsync: jest.fn(async (key: string, value: string, options) => {
      storage[key] = value;
    }),
    getItemAsync: jest.fn(async (key: string, options) => {
      return storage[key];
    }),
    deleteItemAsync: jest.fn(async (key: string, options) => {
      delete storage[key];
    })

  }

});

describe("RNKeyManager", () => {
  const rn = new RNKeyManager();
  it("can generate a private key from a password", async () => {
    const { privateKey, salt } = await rn.generatePrivateKeyFromPassword("test");
    expect(privateKey).toBeInstanceOf(PrivateKey);
    expect(salt).toBeInstanceOf(Checksum256);
  });
  it("can store a key password", async () => {
    const { privateKey, salt } = await rn.generatePrivateKeyFromPassword("test");
    const publicKey = await rn.storeKey({
      privateKey,
      level: KeyManagerLevel.PASSWORD,
      challenge: "test",
    });
    expect(publicKey).toBeInstanceOf(PublicKey);
  });

  // get key password
  it("can get a key password", async () => {
    const { privateKey, salt } = await rn.generatePrivateKeyFromPassword("test");
    const publicKey = await rn.storeKey({
      privateKey,
      level: KeyManagerLevel.PASSWORD,
      challenge: "test",
    });
    const key = await rn.getKey({
      level: KeyManagerLevel.PASSWORD,
    });
    const pub = PublicKey.from(key);
    expect(pub).toBeInstanceOf(PublicKey);
  });

  it("generates same private key from same salt", async () => {
    const salt = randomBytes(32);
    console.log("salt", salt);
    const hash = await rn.generatePrivateKeyFromPassword("test", Checksum256.from(salt));
    const hash2 = await rn.generatePrivateKeyFromPassword("test", Checksum256.from(salt));
    expect(hash2).toEqual(hash);
  })

  // private key is generated in home screen
  it("generates same private key as integration argon", async () => {
    const salt: Checksum256 = Checksum256.from([
      67, 77, 27, 126, 213, 70, 191, 194,
      15, 230, 237, 35, 230, 219, 207, 49,
      136, 31, 150, 160, 31, 233, 136, 96,
      146, 102, 195, 158, 133, 224, 99, 159
    ]);
    const res = await rn.generatePrivateKeyFromPassword("password", salt);
    console.log(res.privateKey.toString());
    console.log(res.salt.toString());
  })

});

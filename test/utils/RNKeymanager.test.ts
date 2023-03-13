import { Bytes, Checksum256, KeyType, PrivateKey, PublicKey } from '@greymass/eosio';
import { KeyManagerLevel, randomBytes, encodeHex } from '@tonomy/tonomy-id-sdk';
import RNKeyManager from '../../src/utils/RNKeyManager';
import * as argon2 from 'react-native-argon2';
import arg from 'argon2';

const mockarg = arg;

jest.mock('react-native-argon2', () => {
    return {
        __esModule: true,
        default: jest.fn(async (passowrd: string, salt: string, options?) => {
            return mockarg
                .hash(passowrd, {
                    raw: true,
                    salt: Buffer.from(salt),
                    type: mockarg.argon2id,
                    hashLength: 32,
                    memoryCost: 16 * 1024,
                    parallelism: 1,
                    timeCost: 3,
                })
                .then((hash) => {
                    return {
                        rawHash: hash.toString('hex'),
                        encoded: 'test value',
                    };
                });
        }),
    };
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
        }),
    };
});

describe('RNKeyManager', () => {
    const rn = new RNKeyManager();

    it('can generate a private key from a password', async () => {
        const { privateKey, salt } = await rn.generatePrivateKeyFromPassword('test');

        expect(privateKey).toBeInstanceOf(PrivateKey);
        expect(salt).toBeInstanceOf(Checksum256);
    });
    it('can store a key password', async () => {
        const { privateKey, salt } = await rn.generatePrivateKeyFromPassword('test');
        const publicKey = await rn.storeKey({
            privateKey,
            level: KeyManagerLevel.PASSWORD,
            challenge: 'test',
        });

        expect(publicKey).toBeInstanceOf(PublicKey);
    });

    // get key password
    it('can get a key password', async () => {
        const { privateKey, salt } = await rn.generatePrivateKeyFromPassword('test');
        const publicKey = await rn.storeKey({
            privateKey,
            level: KeyManagerLevel.PASSWORD,
            challenge: 'test',
        });
        const key = await rn.getKey({
            level: KeyManagerLevel.PASSWORD,
        });
        const pub = PublicKey.from(key);

        expect(pub).toBeInstanceOf(PublicKey);
    });

    it('generates same private key from same salt', async () => {
        const salt = randomBytes(32);
        const hash = await rn.generatePrivateKeyFromPassword('test', Checksum256.from(salt));
        const hash2 = await rn.generatePrivateKeyFromPassword('test', Checksum256.from(salt));

        expect(hash2).toEqual(hash);
    });

    // private key is generated in home screen
    it('generates same private key as integration argon', async () => {
        const salt: string = encodeHex('12345678901234567890123456789012'); // salt
        const encodedSalt: Checksum256 = Checksum256.from(Bytes.from(salt));
        const res = await rn.generatePrivateKeyFromPassword('password', encodedSalt);

        // react
        expect(res.privateKey.toString()).toBe('PVT_K1_pPnFBQwMSQgjAenyLdMHoeFQBtazFBYEWeA12FtKpm5PEY4fc');
    });
});

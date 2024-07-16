import { PublicKey } from '@wharfkit/antelope';
import { KeyManagerLevel } from '@tonomy/tonomy-id-sdk';
import RNKeyManager from '../../src/utils/RNKeyManager';
import arg from 'argon2';
import { generatePrivateKeyFromPassword, generatePrivateKeyFromSeed } from '../../src/utils/keys';
import { EthereumAccount, EthereumPrivateKey, EthereumSepoliaChain } from '../../src/utils/chain/etherum';
import { ethers, TransactionRequest } from 'ethers';

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
                    memoryCost: 64 * 1024,
                    parallelism: 1,
                    timeCost: 40,
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

// mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
    const storage: any = {};

    return {
        getItem: jest.fn(async (key: string, callback?) => {
            return storage[key];
        }),

        setItem: jest.fn(async (key: string, value: string, callback?) => {
            storage[key] = value;
        }),

        removeItem: jest.fn(async (key: string, callback?) => {
            delete storage[key];
        }),
    };
});

describe('RN Key Manager', () => {
    const rn = new RNKeyManager();

    it('can store a key password', async () => {
        const { privateKey, salt } = await generatePrivateKeyFromPassword('test');
        const publicKey = await rn.storeKey({
            privateKey,
            level: KeyManagerLevel.PASSWORD,
            challenge: 'test',
        });

        expect(publicKey).toBeInstanceOf(PublicKey);
    });

    // get key password
    it('can get a key password', async () => {
        const { privateKey } = await generatePrivateKeyFromPassword('test');
        const publicKey = await rn.storeKey({
            privateKey,
            level: KeyManagerLevel.PASSWORD,
            challenge: 'test',
        });
        const key = await rn.getKey({
            level: KeyManagerLevel.PASSWORD,
        });

        expect(key).toBeInstanceOf(PublicKey);
        expect(key.toString()).toEqual(publicKey.toString());
    }, 10000);

    //generate key and sign transaction
    it('generate private key and sign transaction', async () => {
        const ethereumKey = await generatePrivateKeyFromSeed('test', EthereumSepoliaChain);
        const exportPrivateKey = await ethereumKey.exportPrivateKey();
        const ethereumPrivateKey = new EthereumPrivateKey(exportPrivateKey);

        const ethereumAccount = await EthereumAccount.fromPublicKey(
            EthereumSepoliaChain,
            await ethereumPrivateKey.getPublicKey()
        );
        const transactionRequest: TransactionRequest = {
            to: ethereumAccount.getName(),
            from: ethereumAccount.getName(),
            value: ethers.parseEther('0'),
            data: '0x00',
        };

        const signedTransaction = await ethereumPrivateKey.signTransaction(transactionRequest);

        // Check if signedTransaction is defined and not empty
        expect(signedTransaction).toBeDefined();
        expect(signedTransaction).not.toEqual('');

        // Check if signedTransaction is a string in hexadecimal format
        expect(signedTransaction).toMatch(/^0x[a-fA-F0-9]+$/);
    }, 30000);
});

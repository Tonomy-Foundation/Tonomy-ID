import { Bytes, Checksum256, KeyType, PrivateKey } from '@wharfkit/antelope';
import argon2 from 'react-native-argon2';
import { randomBytes, sha256 } from '@tonomy/tonomy-id-sdk';

/**
 * Tests that the generatePrivateKeyFromPassword() correctly generates a private key from a password and salt.
 * This is to ensure it creates the same values as the Tonomy-ID SDK and https://argon2.online
 *
 * This needs to be executed at runtime as the react-native-argon2 library cannot run in nodejs
 */
export async function testKeyGenerator() {
    // See equivalent test in crypto.test.ts in Tonomy-ID-SDK
    try {
        const saltInput = Checksum256.from(sha256('testsalt'));

        const { privateKey, salt } = await generatePrivateKeyFromPassword(
            'above day fever lemon piano sport',
            saltInput
        );

        if (salt.toString() !== '4edf07edc95b2fdcbcaf2378fd12d8ac212c2aa6e326c59c3e629be3039d6432')
            throw new Error('generatePrivateKeyFromPassword() test: Salt is not correct');
        if (privateKey.toString() !== 'PVT_K1_q4BZoScNYFCF5tDthn4m5KUgv9LLH4fTNtMFj3FUkG3p7UA4D')
            throw new Error('generatePrivateKeyFromPassword() test: Key is not correct');
    } catch (e) {
        console.error(e);
    }
}

export async function generatePrivateKeyFromPassword(
    password: string,
    salt?: Checksum256 | undefined
): Promise<{ privateKey: PrivateKey; salt: Checksum256 }> {
    if (!salt) salt = Checksum256.from(randomBytes(32));
    const result = await argon2(password, salt.hexString, {
        mode: 'argon2id',
        iterations: 40,
        memory: 64 * 1024,
        parallelism: 1,
        hashLength: 32,
    });

    const bytes = Bytes.from(result.rawHash, 'hex');
    const privateKey = new PrivateKey(KeyType.K1, bytes);

    return {
        privateKey,
        salt,
    };
}

export async function generatePrivateKeyForEthereum(
    password: string,
    accountName: string,
    salt?: Checksum256 | undefined,
    chainId?: string
): Promise<{ privateKey: PrivateKey; salt: Checksum256; web3PrivateKey: string }> {
    if (!salt) salt = Checksum256.from(sha256(accountName));
    if (chainId) password = password + chainId;
    const result = await argon2(password, salt.hexString, {
        mode: 'argon2id',
        iterations: 40,
        memory: 64 * 1024,
        parallelism: 1,
        hashLength: 32,
    });

    const bytes = Bytes.from(result.rawHash, 'hex');
    const privateKey = new PrivateKey(KeyType.K1, bytes);

    console.log('frontend key', privateKey);
    return {
        privateKey,
        salt,
        web3PrivateKey: '0x' + sha256(privateKey.toString()),
    };
}

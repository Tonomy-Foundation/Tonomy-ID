import { Bytes, Checksum256, KeyType, PrivateKey } from '@greymass/eosio';
import argon2 from 'react-native-argon2';
import { randomBytes, sha256 } from '@tonomy/tonomy-id-sdk';

/**
 * Tests that the generatePrivateKeyFromPassword() correctly generates a private key from a password and salt.
 * This is to ensure it creates the same values as the Tonomy-ID SDK and https://argon2.online
 */
async function testKeyGenerator() {
    try {
        console.log('Testing key generator');
        const saltInput = Checksum256.from(sha256('testsalt'));

        const key = await generatePrivateKeyFromPassword('testpassword', saltInput);

        if (key.salt.toString() !== '4edf07edc95b2fdcbcaf2378fd12d8ac212c2aa6e326c59c3e629be3039d6432')
            throw new Error('generatePrivateKeyFromPassword() test: Salt is not correct');
        if (key.privateKey.toString() !== 'PVT_K1_NXkZkJyhrPzSCpfe2uXbaw8xcKH95e9Gw5LdhkrzMSJwoZL6x')
            throw new Error('generatePrivateKeyFromPassword() test: Key is not correct');

        console.log('Key generator test passed');
    } catch (e) {
        console.error(e);
    }
}

testKeyGenerator();

export async function generatePrivateKeyFromPassword(
    password: string,
    salt?: Checksum256 | undefined
): Promise<{ privateKey: PrivateKey; salt: Checksum256 }> {
    if (!salt) salt = Checksum256.from(randomBytes(32));
    const result = await argon2(password, salt.hexString, {
        mode: 'argon2id',
        iterations: 3,
        memory: 16384,
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

import { Bytes, Checksum256, KeyType, PrivateKey } from '@greymass/eosio';
import argon2 from 'react-native-argon2';
import { randomBytes, decodeHex } from '@tonomy/tonomy-id-sdk';

export async function generatePrivateKeyFromPassword(
    password: string,
    salt?: Checksum256 | undefined
): Promise<{ privateKey: PrivateKey; salt: Checksum256 }> {
    if (!salt) salt = Checksum256.from(randomBytes(32));
    const result = await argon2(password, decodeHex(salt.hexString), {
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

import { Bytes, Checksum256, KeyType, PrivateKey } from '@wharfkit/antelope';
import { hash, ArgonType } from 'argon2-browser';
import { randomBytes } from '@tonomy/tonomy-id-sdk';
import { appStorage, keyStorage } from './StorageManager/setup';
import { getKeyOrNullFromChain, tokenRegistry } from './tokenRegistry';

export async function generatePrivateKeyFromPassword(
    password: string,
    salt?: Checksum256
): Promise<{ privateKey: PrivateKey; salt: Checksum256 }> {
    const { seed, salt: saltString } = await generateSeedFromPassword(password, salt?.hexString);

    const bytes = Bytes.from(seed, 'hex');
    const privateKey = new PrivateKey(KeyType.K1, bytes);

    return {
        privateKey,
        salt: Checksum256.from(saltString),
    };
}

export async function generateSeedFromPassword(
    password: string,
    salt?: string
): Promise<{ seed: string; salt: string }> {
    if (!salt) salt = Checksum256.from(randomBytes(32)).hexString;
    // const result = await argon2(password, salt, {
    //     mode: 'argon2id',
    //     iterations: 40,
    //     memory: 64 * 1024,
    //     parallelism: 1,
    //     hashLength: 32,
    // });
    const result = await hash({
        pass: password,
        salt,
        type: ArgonType.Argon2id,
        time: 40,
        mem: 64 * 1024,
        parallelism: 1,
        hashLen: 32,
    });

    return { seed: result.hashHex as string, salt };
}

export async function savePrivateKeyToStorage(passphrase: string, salt?: string): Promise<void> {
    // Generate the seed data from the password and salt (computationally expensive)
    const { seed } = await generateSeedFromPassword(passphrase, salt);

    await appStorage.setCryptoSeed(seed);

    for (const tokenEntry of tokenRegistry) {
        const { chain, keyName } = tokenEntry;
        let key = await getKeyOrNullFromChain(tokenEntry);

        if (!key) {
            // Generate the key from seed data (computationally cheap)
            key = await chain.createKeyFromSeed(seed);

            await keyStorage.emplaceKey(keyName, key);
        }
    }
}

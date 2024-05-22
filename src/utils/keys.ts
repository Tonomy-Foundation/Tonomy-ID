import { Bytes, Checksum256, KeyType, PrivateKey } from '@wharfkit/antelope';
import argon2 from 'react-native-argon2';
import { randomBytes, sha256 } from '@tonomy/tonomy-id-sdk';
import { EthereumPrivateKey, EthereumAccount } from './chain/etherum';
import { Wallet } from 'ethers';
import { connect } from '../veramo/setup';
import { keyStorageRepository } from '../veramo/repositories/storageRepository';
import { IPrivateKey, IChain } from '../utils/chain/types';

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

        console.log('testing Chain libraries');
        // create EthereumPrivateKey and EthereumAccount
        const privateKeyEth = new EthereumPrivateKey(
            Wallet.fromPhrase('save west spatial goose rotate glass any phrase manual pause category flight').privateKey
        );

        const ethereumAccount = new EthereumAccount(await privateKeyEth.getAddress(), privateKeyEth);

        console.log('ethereumAccount:', ethereumAccount.getName());
    } catch (e) {
        console.error(e);
    }
}

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

async function generateSeedFromPassword(password: string, salt?: string): Promise<{ seed: string; salt: string }> {
    if (!salt) salt = Checksum256.from(randomBytes(32)).hexString;
    const result = await argon2(password, salt, {
        mode: 'argon2id',
        iterations: 40,
        memory: 64 * 1024,
        parallelism: 1,
        hashLength: 32,
    });

    return { seed: result.rawHash as string, salt };
}

async function generatePrivateKeyFromSeed(
    seed: string,
    chain: IChain
): Promise<{ privateKeyHex: string; privateKey: IPrivateKey }> {
    const chainSeed = sha256(seed + chain.getChainId());

    const bytes = Bytes.from(chainSeed, 'hex');
    const privateKeyValue = new PrivateKey(KeyType.K1, bytes);
    const privateKeyHex = '0x' + sha256(privateKeyValue.toString());
    let privateKey;

    if (chain.getName() === 'Ethereum') {
        privateKey = new EthereumPrivateKey(privateKeyHex);
    }

    return {
        privateKeyHex,
        privateKey,
    };
}

export async function savePrivateKeyToStorage(passphrase: string, chain: IChain): Promise<void> {
    const dataSource = await connect();
    const keyStorageRepo = new keyStorageRepository(dataSource);

    const seedData = await generateSeedFromPassword(passphrase);
    const key = await generatePrivateKeyFromSeed(passphrase, chain);

    // Save the key and seed to the keyStorage
    await keyStorageRepo.create('privateKey', key.privateKeyHex);
    await keyStorageRepo.create('seed', seedData.seed);
}

import { DataSource } from 'typeorm';
import { dbConnection, setupDatabase, veramo, veramo2, sha256 } from '@tonomy/tonomy-id-sdk';
import { Entities, migrations } from '@veramo/data-store';
import { Checksum256 } from '@wharfkit/antelope';
import { EthereumPrivateKey, EthereumAccount, EthereumSepoliaChain } from './chain/etherum';
import { ethers, TransactionRequest, Wallet } from 'ethers';
import Debug from 'debug';
import { generatePrivateKeyFromPassword } from './keys';
import * as ExpoSQLite from 'expo-sqlite';

const debug = Debug('tonomy-id:util:runtime-tests');

async function testVeramo() {
    debug('testVeramo() called');
    const dataSource = new DataSource({
        type: 'expo',
        driver: ExpoSQLite,
        database: 'veramo.sqlite',
        migrations: migrations,
        migrationsRun: true,
        logging: ['error', 'info', 'warn'],
        entities: Entities,
    });

    debug('DataSource created');
    await setupDatabase(dataSource);
    debug('Database setup');
    await veramo();
    debug('veramo() called');
    await veramo2();
    debug('veramo2() called');
    const entities = dbConnection.entityMetadatas;

    for (const entity of entities) {
        const repository = dbConnection.getRepository(entity.name);

        await repository.clear(); // This clears all entries from the entity's table.
    }

    debug('Database cleared');
}

/**
 * Tests that the generatePrivateKeyFromPassword() correctly generates a private key from a password and salt.
 * This is to ensure it creates the same values as the Tonomy-ID SDK and https://argon2.online
 *
 * This needs to be executed at runtime as the react-native-argon2 library cannot run in nodejs
 */
export async function testKeyGenerator() {
    // See equivalent test in crypto.test.ts in Tonomy-ID-SDK
    const saltInput = Checksum256.from(sha256('testsalt'));

    const { privateKey, salt } = await generatePrivateKeyFromPassword('above day fever lemon piano sport', saltInput);

    if (salt.toString() !== '4edf07edc95b2fdcbcaf2378fd12d8ac212c2aa6e326c59c3e629be3039d6432')
        throw new Error('generatePrivateKeyFromPassword() test: Salt is not correct');
    if (privateKey.toString() !== 'PVT_K1_q4BZoScNYFCF5tDthn4m5KUgv9LLH4fTNtMFj3FUkG3p7UA4D')
        throw new Error('generatePrivateKeyFromPassword() test: Key is not correct');

    debug(
        'testing Chain libraries',
        Wallet.fromPhrase('save west spatial goose rotate glass any phrase manual pause category flight').privateKey
    );
    const wallet = Wallet.fromPhrase('save west spatial goose rotate glass any phrase manual pause category flight');
    const privateKeyHex = wallet.privateKey;

    const privateKeyEth = new EthereumPrivateKey(privateKeyHex, EthereumSepoliaChain);

    const ethereumAccount = await EthereumAccount.fromPublicKey(
        EthereumSepoliaChain,
        await privateKeyEth.getPublicKey()
    );
    const accountName = await ethereumAccount.getName();

    debug('accountName:', accountName);

    const transactionRequest: TransactionRequest = {
        to: accountName,
        from: accountName,
        value: ethers.parseEther('0'),
        data: '0x00',
    };

    const signedTransaction = await privateKeyEth.signTransaction(transactionRequest);

    debug('signedTransaction:', signedTransaction);
}

export async function runTests() {
    debug('runTests() called');
    await testKeyGenerator();
    // await testVeramo();
}

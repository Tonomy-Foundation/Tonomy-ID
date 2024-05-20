import { createAgent, IDataStore, IDataStoreORM, IKeyManager, IDIDManager } from '@veramo/core';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local';
import { KeyStore, PrivateKeyStore } from '@veramo/data-store';
import { DataSource } from 'typeorm';

const DB_ENCRYPTION_KEY = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c';

const dbConnection = new DataSource({
    type: 'expo',
    driver: require('expo-sqlite'),
    database: 'veramo.sqlite',
    logging: ['error', 'info', 'warn'],
}).initialize();

export const agent = createAgent<IDIDManager & IKeyManager & IDataStore & IDataStoreORM>({
    plugins: [
        new KeyManager({
            store: new KeyStore(dbConnection),
            kms: {
                local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(DB_ENCRYPTION_KEY))),
            },
        }),
    ],
});

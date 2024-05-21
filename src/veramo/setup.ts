import { createAgent, IDataStore, IDataStoreORM, IKeyManager, IDIDManager } from '@veramo/core';
import { DataStore, DataStoreORM } from '@veramo/data-store';
import { DataSource } from 'typeorm';

const dbConnection = new DataSource({
    type: 'expo',
    driver: require('expo-sqlite'),
    database: 'veramo.sqlite',
    logging: ['error', 'info', 'warn'],
}).initialize();

export const agent = createAgent<IDIDManager & IKeyManager & IDataStore & IDataStoreORM>({
    plugins: [
        // new KeyManager({
        //     store: new KeyStore(dbConnection),
        //     kms: {
        //         local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(DB_ENCRYPTION_KEY))),
        //     },
        // }),
        new DataStore(dbConnection),
        new DataStoreORM(dbConnection),
    ],
});

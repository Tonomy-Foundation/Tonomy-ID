import { DataSource } from 'typeorm/browser';
import { storage } from './entities/keyStorage';
import * as ExpoSQLiteDriver from 'expo-sqlite';
import { KeyStorageRepository } from './repositories/KeyStorageRepository';
import { KeyManager } from './repositories/keyManager';
import { AppStorageRepository } from './repositories/AppSettingRepository';
import { AppStorage } from './repositories/appStorage';

export const dataSource = new DataSource({
    database: 'storage',
    driver: ExpoSQLiteDriver,
    entities: [storage],
    synchronize: false,
    type: 'expo',
});

// Create the key repository instances
const keyStorageRepository = new KeyStorageRepository(dataSource);

class ConcreteKeyManager extends KeyManager {
    constructor(repository: KeyStorageRepository) {
        super(repository);
    }
}
export const keyManager = new ConcreteKeyManager(keyStorageRepository);

// Create the app storage repository instances
const appStorageRepository = new AppStorageRepository(dataSource);

class ConcreteAppManager extends AppStorage {
    constructor(repository: AppStorageRepository) {
        super(repository);
    }
}
export const appStorage = new ConcreteAppManager(appStorageRepository);

//initialize the data source
export async function connect() {
    if (!dataSource.isInitialized) {
        await dataSource.initialize();
    }

    return dataSource;
}

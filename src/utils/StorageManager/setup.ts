import { DataSource, Repository, getRepository } from 'typeorm/browser';
import { KeyStorage } from './entities/keyStorage';
import { AppStorage } from './entities/appSettings';
import * as ExpoSQLiteDriver from 'expo-sqlite';
import { KeyStorageRepository } from './repositories/KeyStorageRepository';
import { KeyManager } from './repositories/keyStorageManager';
import { AppStorageRepository } from './repositories/appSettingRepository';
import { AppStorageManager } from './repositories/appStorageManager';

export const dataSource = new DataSource({
    database: 'storage',
    driver: ExpoSQLiteDriver,
    entities: [KeyStorage, AppStorage],
    type: 'expo',
});

// Create the key repository instances
const keyStorageRepository = new KeyStorageRepository(dataSource);

class ConcreteKeyManager extends KeyManager {
    constructor(repository: KeyStorageRepository) {
        super(repository);
    }
}
export const keyStorage = new ConcreteKeyManager(keyStorageRepository);

// Create the app storage repository instances
const appStorageRepository = new AppStorageRepository(dataSource);

class ConcreteAppManager extends AppStorageManager {
    constructor(repository: AppStorageRepository) {
        super(repository);
    }
}
export const appStorage = new ConcreteAppManager(appStorageRepository);

async function checkTableExists(dataSource, tableName) {
    const queryRunner = dataSource.createQueryRunner();
    const result = await queryRunner.query(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName]);

    await queryRunner.release();
    return result.length > 0;
}

//initialize the data source
export async function connect() {
    if (!dataSource.isInitialized) {
        await dataSource.initialize();
    }

    // Get the repositories
    const appTableExists = await checkTableExists(dataSource, 'AppStorage');
    const keyTableExists = await checkTableExists(dataSource, 'KeyStorage');

    // If the tables don't exist, synchronize the schema
    if (!appTableExists || !keyTableExists) {
        await dataSource.synchronize();
    }

    return dataSource;
}

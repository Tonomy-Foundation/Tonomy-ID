import { DataSource } from 'typeorm';
import { KeyStorage } from './entities/keyStorage';
import { AppStorage } from './entities/appSettings';
import * as ExpoSQLite from 'expo-sqlite/legacy';
import { KeyStorageRepository } from './repositories/KeyStorageRepository';
import { KeyManager } from './repositories/keyStorageManager';
import { AppStorageRepository } from './repositories/appStorageRepository';
import { AppStorageManager } from './repositories/appStorageManager';
import { AssetStorageRepository } from './repositories/assetStorageRepository';
import { AssetStorageManager } from './repositories/assetStorageManager';
import { AssetStorage } from './entities/assetStorage';
import DebugAndLog from '../debug';
import { isNetworkError } from '../errors';

const debug = DebugAndLog('tonomy-id:storageManager:setup');

export const dataSource = new DataSource({
    database: 'storage',
    driver: ExpoSQLite,
    entities: [KeyStorage, AppStorage, AssetStorage],
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

// Create the asset storage repository instances
const assetStorageRepository = new AssetStorageRepository(dataSource);

class ConcreteAssetManager extends AssetStorageManager {
    constructor(repository: AssetStorageRepository) {
        super(repository);
    }
}
export const assetStorage = new ConcreteAssetManager(assetStorageRepository);

async function checkTableExists(dataSource, tableName) {
    const queryRunner = dataSource.createQueryRunner();
    const result = await queryRunner.query(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName]);

    await queryRunner.release();
    return result.length > 0;
}

//initialize the data source
export async function connect() {
    try {
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }

        // Get the repositories
        const appTableExists = await checkTableExists(dataSource, 'AppStorage');
        const keyTableExists = await checkTableExists(dataSource, 'KeyStorage');
        const assetTableExists = await checkTableExists(dataSource, 'AssetStorage');

        // If the tables don't exist, synchronize the schema
        if (!appTableExists || !keyTableExists || !assetTableExists) {
            await dataSource.synchronize();
        }

        return dataSource;
    } catch (error) {
        if (isNetworkError(error)) {
            debug('Network error occurred. Retrying...');
        } else {
            debug('StorageManager.connect() error', error);
        }
    }
}

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
import Debug from '../debug';
import { isNetworkError } from '../errors';
import { captureError } from '../sentry';

const debug = Debug('tonomy-id:storageManager:setup');

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

    try {
        const result = await queryRunner.query(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [
            tableName,
        ]);

        debug(`Table check result for ${tableName}:`, result);
        return result.length > 0;
    } finally {
        await queryRunner.release();
    }
}

async function runAssetNameMigration(dataSource) {
    const queryRunner = dataSource.createQueryRunner();

    try {
        const result = await queryRunner.query(
            `UPDATE AssetStorage 
             SET assetName = REPLACE(assetName, 'Tonomy Staging-LEOS', 'Tonomy Staging-TONO') 
             WHERE assetName LIKE '%Tonomy Staging-LEOS%'`
        );

        // Instead of checking result.length, check the affected rows
        if (result[0]?.changes > 0) {
            console.log(`Migration executed: ${result[0].changes} rows updated.`);
        } else {
            console.log('No rows affected by migration.');
        }

        return result[0]?.changes > 0;
    } finally {
        await queryRunner.release();
    }
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

        // Check if the tables exist after synchronization
        await runAssetNameMigration(dataSource);

        return dataSource;
    } catch (error) {
        if (isNetworkError(error)) {
            debug('Network error occurred. Retrying...');
        } else {
            captureError('StorageManager.connect() error', error);
        }
    }
}

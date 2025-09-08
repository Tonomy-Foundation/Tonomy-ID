import { DataSource } from 'typeorm';
import { KeyStorage } from './entities/keyStorage';
import { AppStorage } from './entities/appSettingsStorage';
import * as ExpoSQLite from 'expo-sqlite';
import { KeyStorageRepository } from './repositories/KeyStorageRepository';
import { KeyManager } from './repositories/keyStorageManager';
import { AppStorageRepository } from './repositories/appSettingsStorageRepository';
import { AppStorageManager } from './repositories/appSettingsStorageManager';
import { AssetStorageRepository } from './repositories/assetStorageRepository';
import { AssetStorageManager } from './repositories/assetStorageManager';
import { AssetStorage } from './entities/assetStorage';
import Debug from '../debug';
import { isNetworkError } from '../errors';
import { captureError } from '../sentry';
import { AssetNameMigration163837490194410 } from './migrations/assetNameMigration';
import { IdentityVerificationStorage } from '@tonomy/tonomy-id-sdk';
import { AddReuseCountColumn163837490194410 } from './migrations/addReuseCountMigration';

const debug = Debug('tonomy-id:storageManager:setup');

export const kycDatasource = new DataSource({
    database: 'kycstorage',
    entities: [IdentityVerificationStorage],
    type: 'expo',
    driver: ExpoSQLite,
    migrations: [AddReuseCountColumn163837490194410],
});

export const dataSource = new DataSource({
    database: 'storage',
    driver: ExpoSQLite,
    entities: [KeyStorage, AppStorage, AssetStorage],
    type: 'expo',
    migrations: [AssetNameMigration163837490194410],
});

// TODO: clean this
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

export async function checkReposExists() {
    // Get the repositories
    const appTableExists = await checkTableExists(dataSource, 'AppStorage');
    const keyTableExists = await checkTableExists(dataSource, 'KeyStorage');
    const assetTableExists = await checkTableExists(dataSource, 'AssetStorage');

    // If the tables don't exist, synchronize the schema
    if (!appTableExists || !keyTableExists || !assetTableExists) {
        return false;
    } else return true;
}

//initialize the data source
export async function connect() {
    try {
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
            await dataSource.runMigrations();
        }

        const isExists = await checkReposExists();

        if (!isExists) {
            await dataSource.synchronize();
        }

        return dataSource;
    } catch (error) {
        if (isNetworkError(error)) {
            debug('Network error occurred. Retrying...');
        } else {
            captureError('StorageManager.connect() error', error);
        }
    }
}

import { DataSource } from 'typeorm';
import { KeyStorage } from './entities/keyStorage';
import { AppStorage } from './entities/appSettings';
import * as ExpoSQLiteDriver from 'expo-sqlite';
import { KeyStorageRepository } from './repositories/KeyStorageRepository';
import { KeyManager } from './repositories/keyStorageManager';
import { AppStorageRepository } from './repositories/appSettingRepository';
import { AppStorageManager } from './repositories/appStorageManager';
import { AssetStorageRepository } from './repositories/assetStorageRepository';
import { AssetStorageManager } from './repositories/assetStorageManager';
import { AssetStorage } from './entities/assetStorage';

export const dataSource = new DataSource({
    database: 'storage',
    driver: ExpoSQLiteDriver,
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

async function resetAssetTable() {
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
        // Drop the AssetRecordStorage table
        await queryRunner.query('DROP TABLE IF EXISTS "AssetStorage"');
        console.log('AssetStorage table dropped successfully.');

        // Synchronize the schema
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }

        await dataSource.synchronize();
        console.log('Schema synchronized successfully.');
    } catch (error) {
        console.error('Error resetting AssetStorage table:', error);
    } finally {
        await queryRunner.release();
    }
}

//initialize the data source
export async function connect() {
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
}

// Call resetAssetTable to drop the AssetRecordStorage table and synchronize schema
resetAssetTable().catch((error) => {
    console.error('Error in resetAssetTable:', error);
});

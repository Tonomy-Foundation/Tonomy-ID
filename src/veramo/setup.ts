import { DataSource } from 'typeorm/browser';
import { keyStorage } from './entities/keyStorage';
import * as ExpoSQLiteDriver from 'expo-sqlite';

export const dataSource = new DataSource({
    database: 'storage',
    driver: ExpoSQLiteDriver,
    entities: [keyStorage],
    synchronize: false,
    type: 'expo',
});

export function connect() {
    if (dataSource.isInitialized) return Promise.resolve(dataSource);
    else return dataSource.initialize();
}

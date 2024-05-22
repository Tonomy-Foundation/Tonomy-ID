import { DataSource } from 'typeorm/browser';
import { keyStorage } from './entities/keyStorage';

export const dataSource = new DataSource({
    database: 'storage',
    driver: require('expo-sqlite'),
    entities: [keyStorage],
    synchronize: false,
    type: 'expo',
});

export function connect() {
    if (dataSource.isInitialized) return Promise.resolve(dataSource);
    else return dataSource.initialize();
}

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
    return dataSource.initialize();
}

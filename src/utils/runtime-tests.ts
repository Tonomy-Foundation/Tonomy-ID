import { DataSource } from 'typeorm';
import { testKeyGenerator } from './keys';
import { dbConnection, setupDatabase, veramo, veramo2 } from '@tonomy/tonomy-id-sdk';
import { Entities, migrations } from '@veramo/data-store';
import Debug from 'debug';

const debug = Debug('tonomy-id:util:runtime-tests');

const dataSource = new DataSource({
    type: 'expo',
    driver: require('expo-sqlite'),
    database: 'veramo.sqlite',
    migrations: migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: Entities,
});

async function testVeramo() {
    debug('testVeramo() called');
    await setupDatabase(dataSource);
    debug('Database setup');
    await veramo();
    debug('veramo() called');
    await veramo2();
    debug('veramo2() called');
    const entities = dbConnection.entityMetadatas;

    for (const entity of entities) {
        const repository = dbConnection.getRepository(entity.name);

        await repository.clear(); // This clears all entries from the entity's table.
    }

    debug('Database cleared');
}

export async function runTests() {
    await testKeyGenerator();
    // await testVeramo();
}

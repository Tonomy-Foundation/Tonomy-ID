import { testKeyGenerator } from './keys';
import { dbConnection, setupDatabase, veramo, veramo2 } from '@tonomy/tonomy-id-sdk';

async function testVeramo() {
    console.log('testVeramo');
    await setupDatabase();
    console.log('setupDatabase');
    await veramo();
    console.log('veramo');
    await veramo2();
    console.log('veramo2');
    const entities = dbConnection.entityMetadatas;

    for (const entity of entities) {
        const repository = dbConnection.getRepository(entity.name);

        await repository.clear(); // This clears all entries from the entity's table.
    }
}

export async function runTests() {
    await testKeyGenerator();
    await testVeramo();
}

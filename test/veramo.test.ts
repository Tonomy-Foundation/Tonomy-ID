import { dbConnection, setupDatabase, veramo, veramo2 } from '@tonomy/tonomy-id-sdk';
import Debug from 'debug';

describe('veramo', () => {
    beforeAll(async () => {
        await setupDatabase();
    });

    afterEach(async () => {
        const entities = dbConnection.entityMetadatas;

        for (const entity of entities) {
            const repository = dbConnection.getRepository(entity.name);

            await repository.clear(); // This clears all entries from the entity's table.
        }
    });

    test('1', async () => {
        await veramo();
    });

    test('2', async () => {
        await veramo2();
    });
});

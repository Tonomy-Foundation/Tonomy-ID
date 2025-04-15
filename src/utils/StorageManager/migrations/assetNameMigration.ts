import { MigrationInterface, QueryRunner } from 'typeorm';
import settings from '../../../settings';
import Debug from 'debug';

const debug = Debug('tonomy-id:utils:storageManager:migrations:assetNameMigration');

export class AssetNameMigration163837490194480 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const chainName = settings.config.ecosystemName;
        const name = chainName + '-' + 'LEOS';
        const newName = chainName + '-' + 'TONO';

        // First check if any records match
        const result = await queryRunner.query(`SELECT COUNT(*) FROM AssetStorage WHERE assetName LIKE '%${name}%'`);

        const count = parseInt(result[0]['COUNT(*)'], 10);

        debug(`Found ${count} records to update.`);

        if (count > 0) {
            try {
                const updateQuery = `
                UPDATE AssetStorage
                SET assetName = REPLACE(assetName, '${name}', '${newName}')
                WHERE assetName LIKE '%${name}%'`;

                debug(`Executing update query: ${updateQuery}`);

                await queryRunner.query(updateQuery);
                await queryRunner.query(`
                    DELETE FROM AssetStorage
                    WHERE assetName LIKE '%${name}%'
                  `);
            } catch (error) {
                console.error('❌ Update query failed:', error);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        debug('down function not implemented yet.');
    }
}

import { MigrationInterface, QueryRunner } from 'typeorm';
import settings from '../../../settings';

export class AssetNameMigration163837490194480 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const name = settings.config.ecosystemName + '-' + 'LEOS';
        const newName = settings.config.ecosystemName + '-' + 'TONO';

        // First check if any records match
        const result = await queryRunner.query(`SELECT COUNT(*) FROM AssetStorage WHERE assetName LIKE '%${name}%'`);

        const count = parseInt(result[0]['COUNT(*)'], 10);

        if (count > 0) {
            try {
                const updateQuery = `
                UPDATE AssetStorage
                SET assetName = REPLACE(assetName, '${name}', '${newName}')
                WHERE assetName LIKE '%${name}%'`;

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
        const name = settings.config.ecosystemName + '-' + 'LEOS';
        const newName = settings.config.ecosystemName + '-' + 'TONO';

        // Optional rollback (revert the changes)
        await queryRunner.query(
            `UPDATE AssetStorage
             SET assetName = REPLACE(assetName, '${newName}', '${name}')
             WHERE assetName LIKE '%${newName}%'`
        );
        console.log('Migration: AssetNameMigration reverted.');
    }
}

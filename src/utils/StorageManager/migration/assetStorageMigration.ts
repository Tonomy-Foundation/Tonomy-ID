import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAssetNameValueMigration implements MigrationInterface {
    name = 'UpdateAssetNameValueMigration';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Example: update assetName from 'old-asset' to 'new-asset'
        await queryRunner.query(`
        UPDATE AssetStorage
        SET assetName = 'new-asset'
        WHERE assetName = 'old-asset'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert back in case of rollback
        await queryRunner.query(`
        UPDATE AssetStorage
        SET assetName = 'old-asset'
        WHERE assetName = 'new-asset'
        `);
    }
}

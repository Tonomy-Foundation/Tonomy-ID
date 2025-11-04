import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReuseCountColumn163837490194410 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('IdentityVerificationStorage');

        if (tableExists) {
            const columnExists = await queryRunner.hasColumn('IdentityVerificationStorage', 'reuseCount');

            if (!columnExists) {
                await queryRunner.query(`
                ALTER TABLE "IdentityVerificationStorage" 
                ADD COLUMN "reuseCount" integer NOT NULL DEFAULT 0
            `);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('IdentityVerificationStorage');

        if (tableExists) {
            const columnExists = await queryRunner.hasColumn('IdentityVerificationStorage', 'reuseCount');

            if (columnExists) {
                await queryRunner.query(`
                    ALTER TABLE "IdentityVerificationStorage" 
                    DROP COLUMN "reuseCount"
                `);
            }
        }
    }
}

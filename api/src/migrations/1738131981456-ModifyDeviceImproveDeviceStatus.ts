import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyDeviceImproveDeviceStatus1738131981456 implements MigrationInterface {
    name = 'ModifyDeviceImproveDeviceStatus1738131981456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`device\` ADD \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`device\` ADD \`status\` varchar(255) NULL`);
    }

}

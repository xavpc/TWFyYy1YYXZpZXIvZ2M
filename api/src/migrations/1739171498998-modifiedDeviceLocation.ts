import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedDeviceLocation1739171498998 implements MigrationInterface {
    name = 'ModifiedDeviceLocation1739171498998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP COLUMN \`timestamp\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD \`push_timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD \`current_location_timestamp\` timestamp NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP COLUMN \`current_location_timestamp\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP COLUMN \`push_timestamp\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

}

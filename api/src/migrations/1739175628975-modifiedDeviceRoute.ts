import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedDeviceRoute1739175628975 implements MigrationInterface {
    name = 'ModifiedDeviceRoute1739175628975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_route\` ADD \`status\` enum ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_route\` DROP COLUMN \`status\``);
    }

}

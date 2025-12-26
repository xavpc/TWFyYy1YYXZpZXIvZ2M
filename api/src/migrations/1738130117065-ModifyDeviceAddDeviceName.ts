import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyDeviceAddDeviceName1738130117065 implements MigrationInterface {
    name = 'ModifyDeviceAddDeviceName1738130117065'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device\` ADD \`device_name\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device\` DROP COLUMN \`device_name\``);
    }

}

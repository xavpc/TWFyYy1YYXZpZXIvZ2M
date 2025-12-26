import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyDeviceLocation1738142218609 implements MigrationInterface {
    name = 'ModifyDeviceLocation1738142218609'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_location\` CHANGE \`sequence\` \`sequence\` int NOT NULL AUTO_INCREMENT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_location\` CHANGE \`sequence\` \`sequence\` int NOT NULL`);
    }

}

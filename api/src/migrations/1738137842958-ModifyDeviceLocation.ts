import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyDeviceLocation1738137842958 implements MigrationInterface {
    name = 'ModifyDeviceLocation1738137842958'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD \`sequence\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD UNIQUE INDEX \`IDX_eb5c5447b6b6d93e64740cf610\` (\`sequence\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_SEQUENCE\` ON \`device_location\` (\`sequence\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_SEQUENCE\` ON \`device_location\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP INDEX \`IDX_eb5c5447b6b6d93e64740cf610\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP COLUMN \`sequence\``);
    }

}

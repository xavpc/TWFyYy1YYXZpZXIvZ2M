import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedSequenceFromDeviceLocation1739806995249 implements MigrationInterface {
    name = 'RemovedSequenceFromDeviceLocation1739806995249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_SEQUENCE\` ON \`device_location\``);
        await queryRunner.query(`DROP INDEX \`IDX_eb5c5447b6b6d93e64740cf610\` ON \`device_location\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP COLUMN \`sequence\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD \`sequence\` int NOT NULL DEFAULT 0`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_eb5c5447b6b6d93e64740cf610\` ON \`device_location\` (\`sequence\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_SEQUENCE\` ON \`device_location\` (\`sequence\`)`);
    }

}

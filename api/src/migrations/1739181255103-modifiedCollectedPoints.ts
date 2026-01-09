import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedCollectedPoints1739181255103 implements MigrationInterface {
    name = 'ModifiedCollectedPoints1739181255103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP COLUMN \`timestamp\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD \`push_timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD \`collected_timestamp\` timestamp NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP COLUMN \`collected_timestamp\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP COLUMN \`push_timestamp\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

}

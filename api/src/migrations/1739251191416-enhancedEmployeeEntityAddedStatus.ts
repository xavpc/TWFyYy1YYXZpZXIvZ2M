import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhancedEmployeeEntityAddedStatus1739251191416 implements MigrationInterface {
    name = 'EnhancedEmployeeEntityAddedStatus1739251191416'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`status\``);
    }

}

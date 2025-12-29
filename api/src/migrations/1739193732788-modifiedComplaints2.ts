import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedComplaints21739193732788 implements MigrationInterface {
    name = 'ModifiedComplaints21739193732788'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`complaints\` DROP COLUMN \`timestamp\``);
        await queryRunner.query(`ALTER TABLE \`complaints\` ADD \`push_timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`complaints\` ADD \`complaint_timestamp\` timestamp NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`complaints\` DROP COLUMN \`complaint_timestamp\``);
        await queryRunner.query(`ALTER TABLE \`complaints\` DROP COLUMN \`push_timestamp\``);
        await queryRunner.query(`ALTER TABLE \`complaints\` ADD \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

}

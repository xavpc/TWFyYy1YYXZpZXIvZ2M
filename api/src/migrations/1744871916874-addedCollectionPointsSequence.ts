import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCollectionPointsSequence1744871916874 implements MigrationInterface {
    name = 'AddedCollectionPointsSequence1744871916874'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`collection_points\` ADD \`sequence\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_9760615d88ed518196bb79ea03d\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`employee_id\` \`employee_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`reports\` CHANGE \`report_timestamp\` \`report_timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`reports\` CHANGE \`remarks\` \`remarks\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`end\` \`end\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_9760615d88ed518196bb79ea03d\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_9760615d88ed518196bb79ea03d\``);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`end\` \`end\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`reports\` CHANGE \`remarks\` \`remarks\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`reports\` CHANGE \`report_timestamp\` \`report_timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`employee_id\` \`employee_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_9760615d88ed518196bb79ea03d\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collection_points\` DROP COLUMN \`sequence\``);
    }

}

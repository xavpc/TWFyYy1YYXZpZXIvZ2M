import { MigrationInterface, QueryRunner } from "typeorm";

export class TryfixUserEmployeeRelationship31740740984383 implements MigrationInterface {
    name = 'TryfixUserEmployeeRelationship31740740984383'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`employee_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_9760615d88ed518196bb79ea03\` (\`employee_id\`)`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_a120e9fc371ba4554a30df7671a\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_34af9ee456dea48a4ad2834aee8\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`collection_point_id\` \`collection_point_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`device_id\` \`device_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_9760615d88ed518196bb79ea03\` ON \`users\` (\`employee_id\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_9760615d88ed518196bb79ea03d\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_a120e9fc371ba4554a30df7671a\` FOREIGN KEY (\`collection_point_id\`) REFERENCES \`collection_points\`(\`collection_point_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_34af9ee456dea48a4ad2834aee8\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_34af9ee456dea48a4ad2834aee8\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_a120e9fc371ba4554a30df7671a\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_9760615d88ed518196bb79ea03d\``);
        await queryRunner.query(`DROP INDEX \`REL_9760615d88ed518196bb79ea03\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`device_id\` \`device_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`collection_point_id\` \`collection_point_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_34af9ee456dea48a4ad2834aee8\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_a120e9fc371ba4554a30df7671a\` FOREIGN KEY (\`collection_point_id\`) REFERENCES \`collection_points\`(\`collection_point_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_9760615d88ed518196bb79ea03\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`employee_id\``);
    }

}

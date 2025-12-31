import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedUserEntity1740719429993 implements MigrationInterface {
    name = 'UpdatedUserEntity1740719429993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_135936b6918bd375a4479b92311\``);
        await queryRunner.query(`DROP INDEX \`REL_135936b6918bd375a4479b9231\` ON \`user\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`employee_id\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`employee_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_135936b6918bd375a4479b9231\` (\`employee_id\`)`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_a120e9fc371ba4554a30df7671a\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_34af9ee456dea48a4ad2834aee8\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`collection_point_id\` \`collection_point_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`device_id\` \`device_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_135936b6918bd375a4479b9231\` ON \`user\` (\`employee_id\`)`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_135936b6918bd375a4479b92311\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_a120e9fc371ba4554a30df7671a\` FOREIGN KEY (\`collection_point_id\`) REFERENCES \`collection_points\`(\`collection_point_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_34af9ee456dea48a4ad2834aee8\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_34af9ee456dea48a4ad2834aee8\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_a120e9fc371ba4554a30df7671a\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_135936b6918bd375a4479b92311\``);
        await queryRunner.query(`DROP INDEX \`REL_135936b6918bd375a4479b9231\` ON \`user\``);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`device_id\` \`device_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`collection_point_id\` \`collection_point_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_34af9ee456dea48a4ad2834aee8\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_a120e9fc371ba4554a30df7671a\` FOREIGN KEY (\`collection_point_id\`) REFERENCES \`collection_points\`(\`collection_point_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_135936b6918bd375a4479b9231\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`employee_id\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`employee_id\` char(1) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_135936b6918bd375a4479b9231\` ON \`user\` (\`employee_id\`)`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_135936b6918bd375a4479b92311\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

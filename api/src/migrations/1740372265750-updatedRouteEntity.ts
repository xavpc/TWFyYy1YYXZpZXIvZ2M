import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedRouteEntity1740372265750 implements MigrationInterface {
    name = 'UpdatedRouteEntity1740372265750'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_a120e9fc371ba4554a30df7671a\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_34af9ee456dea48a4ad2834aee8\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`collection_point_id\` \`collection_point_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`device_id\` \`device_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`route\` CHANGE \`center_latitude\` \`center_latitude\` decimal(8,6) NOT NULL DEFAULT '36.204800'`);
        await queryRunner.query(`ALTER TABLE \`route\` CHANGE \`center_longitude\` \`center_longitude\` decimal(9,6) NOT NULL DEFAULT '138.252900'`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_a120e9fc371ba4554a30df7671a\` FOREIGN KEY (\`collection_point_id\`) REFERENCES \`collection_points\`(\`collection_point_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_34af9ee456dea48a4ad2834aee8\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_34af9ee456dea48a4ad2834aee8\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_a120e9fc371ba4554a30df7671a\``);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`route\` CHANGE \`center_longitude\` \`center_longitude\` decimal(9,6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`route\` CHANGE \`center_latitude\` \`center_latitude\` decimal(8,6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`device_id\` \`device_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`collection_point_id\` \`collection_point_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_34af9ee456dea48a4ad2834aee8\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_a120e9fc371ba4554a30df7671a\` FOREIGN KEY (\`collection_point_id\`) REFERENCES \`collection_points\`(\`collection_point_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedDeviceRouteRestriction1742309839834 implements MigrationInterface {
    name = 'ModifiedDeviceRouteRestriction1742309839834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`device_route\` (\`device_route_id\` varchar(36) NOT NULL, \`day_assigned\` enum ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') NOT NULL, \`device_id\` char(36) NOT NULL, \`route_id\` char(36) NOT NULL, UNIQUE INDEX \`IDX_b2d6d6ddeaab8e24250aa1164b\` (\`route_id\`, \`day_assigned\`, \`device_id\`), PRIMARY KEY (\`device_route_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_9760615d88ed518196bb79ea03d\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`employee_id\` \`employee_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_a120e9fc371ba4554a30df7671a\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_34af9ee456dea48a4ad2834aee8\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_4d5ee4a43972b357c3e8fe09c9c\``);
        await queryRunner.query(`DROP INDEX \`IDX_f5758fb9a9cf67956ecf461eae\` ON \`collected_points\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`collection_point_id\` \`collection_point_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`device_id\` \`device_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`session_id\` \`session_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`device_session\` DROP FOREIGN KEY \`FK_c3d17b3aaf6e84b88576467520a\``);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`end\` \`end\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`route_id\` \`route_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP FOREIGN KEY \`FK_4a7339bb286ec828b950bfa89cc\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` CHANGE \`session_id\` \`session_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_f5758fb9a9cf67956ecf461eae\` ON \`collected_points\` (\`collection_point_id\`, \`session_id\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_9760615d88ed518196bb79ea03d\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_route\` ADD CONSTRAINT \`FK_250519789a36c7f5689440498ea\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_route\` ADD CONSTRAINT \`FK_a8723dd815781c1b6c58530eda4\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_a120e9fc371ba4554a30df7671a\` FOREIGN KEY (\`collection_point_id\`) REFERENCES \`collection_points\`(\`collection_point_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_34af9ee456dea48a4ad2834aee8\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_4d5ee4a43972b357c3e8fe09c9c\` FOREIGN KEY (\`session_id\`) REFERENCES \`device_session\`(\`session_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_session\` ADD CONSTRAINT \`FK_c3d17b3aaf6e84b88576467520a\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD CONSTRAINT \`FK_4a7339bb286ec828b950bfa89cc\` FOREIGN KEY (\`session_id\`) REFERENCES \`device_session\`(\`session_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP FOREIGN KEY \`FK_4a7339bb286ec828b950bfa89cc\``);
        await queryRunner.query(`ALTER TABLE \`device_session\` DROP FOREIGN KEY \`FK_c3d17b3aaf6e84b88576467520a\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_4d5ee4a43972b357c3e8fe09c9c\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_34af9ee456dea48a4ad2834aee8\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_a120e9fc371ba4554a30df7671a\``);
        await queryRunner.query(`ALTER TABLE \`device_route\` DROP FOREIGN KEY \`FK_a8723dd815781c1b6c58530eda4\``);
        await queryRunner.query(`ALTER TABLE \`device_route\` DROP FOREIGN KEY \`FK_250519789a36c7f5689440498ea\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_9760615d88ed518196bb79ea03d\``);
        await queryRunner.query(`DROP INDEX \`IDX_f5758fb9a9cf67956ecf461eae\` ON \`collected_points\``);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`device_location\` CHANGE \`session_id\` \`session_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD CONSTRAINT \`FK_4a7339bb286ec828b950bfa89cc\` FOREIGN KEY (\`session_id\`) REFERENCES \`device_session\`(\`session_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`route_id\` \`route_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`end\` \`end\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`device_session\` ADD CONSTRAINT \`FK_c3d17b3aaf6e84b88576467520a\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`session_id\` \`session_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`device_id\` \`device_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`collection_point_id\` \`collection_point_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_f5758fb9a9cf67956ecf461eae\` ON \`collected_points\` (\`collection_point_id\`, \`session_id\`)`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_4d5ee4a43972b357c3e8fe09c9c\` FOREIGN KEY (\`session_id\`) REFERENCES \`device_session\`(\`session_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_34af9ee456dea48a4ad2834aee8\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_a120e9fc371ba4554a30df7671a\` FOREIGN KEY (\`collection_point_id\`) REFERENCES \`collection_points\`(\`collection_point_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`employee_id\` \`employee_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_9760615d88ed518196bb79ea03d\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP INDEX \`IDX_b2d6d6ddeaab8e24250aa1164b\` ON \`device_route\``);
        await queryRunner.query(`DROP TABLE \`device_route\``);
    }

}

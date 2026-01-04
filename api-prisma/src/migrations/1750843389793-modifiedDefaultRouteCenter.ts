import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedDefaultRouteCenter1750843389793 implements MigrationInterface {
    name = 'ModifiedDefaultRouteCenter1750843389793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_9760615d88ed518196bb79ea03d\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`employee_id\` \`employee_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`complaints\` CHANGE \`complaint_timestamp\` \`complaint_timestamp\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`route\` CHANGE \`center_latitude\` \`center_latitude\` decimal(8,6) NOT NULL DEFAULT '35.676398'`);
        await queryRunner.query(`ALTER TABLE \`route\` CHANGE \`center_longitude\` \`center_longitude\` decimal(9,6) NOT NULL DEFAULT '139.699326'`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`collected_timestamp\` \`collected_timestamp\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reports\` CHANGE \`report_timestamp\` \`report_timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`reports\` CHANGE \`remarks\` \`remarks\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`reports\` CHANGE \`session_start_time\` \`session_start_time\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`reports\` CHANGE \`session_end_time\` \`session_end_time\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`start\` \`start\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`end\` \`end\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`device_location\` CHANGE \`current_location_timestamp\` \`current_location_timestamp\` timestamp NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_9760615d88ed518196bb79ea03d\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_9760615d88ed518196bb79ea03d\``);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`device_location\` CHANGE \`current_location_timestamp\` \`current_location_timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`end\` \`end\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`start\` \`start\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`reports\` CHANGE \`session_end_time\` \`session_end_time\` timestamp NOT NULL DEFAULT ''0000-00-00 00:00:00''`);
        await queryRunner.query(`ALTER TABLE \`reports\` CHANGE \`session_start_time\` \`session_start_time\` timestamp NOT NULL DEFAULT ''0000-00-00 00:00:00''`);
        await queryRunner.query(`ALTER TABLE \`reports\` CHANGE \`remarks\` \`remarks\` text NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`reports\` CHANGE \`report_timestamp\` \`report_timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`collected_timestamp\` \`collected_timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`route\` CHANGE \`center_longitude\` \`center_longitude\` decimal(9,6) NOT NULL DEFAULT '138.252900'`);
        await queryRunner.query(`ALTER TABLE \`route\` CHANGE \`center_latitude\` \`center_latitude\` decimal(8,6) NOT NULL DEFAULT '36.204800'`);
        await queryRunner.query(`ALTER TABLE \`complaints\` CHANGE \`complaint_timestamp\` \`complaint_timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`employee_id\` \`employee_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_9760615d88ed518196bb79ea03d\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

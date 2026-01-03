import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedNewFieldInRouteCoordinates1750659858333 implements MigrationInterface {
    name = 'AddedNewFieldInRouteCoordinates1750659858333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` ADD \`is_user_point\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_9760615d88ed518196bb79ea03d\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`employee_id\` \`employee_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`complaints\` CHANGE \`complaint_timestamp\` \`complaint_timestamp\` timestamp NOT NULL`);
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
        await queryRunner.query(`ALTER TABLE \`complaints\` CHANGE \`complaint_timestamp\` \`complaint_timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`employee_id\` \`employee_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_9760615d88ed518196bb79ea03d\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` DROP COLUMN \`is_user_point\``);
    }

}

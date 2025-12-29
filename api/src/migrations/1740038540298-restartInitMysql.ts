import { MigrationInterface, QueryRunner } from "typeorm";

export class RestartInitMysql1740038540298 implements MigrationInterface {
    name = 'RestartInitMysql1740038540298'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`device_location\` (\`device_location_id\` varchar(36) NOT NULL, \`latitude\` decimal(8,6) NOT NULL, \`longitude\` decimal(9,6) NOT NULL, \`push_timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`current_location_timestamp\` timestamp NOT NULL, \`device_id\` char(36) NOT NULL, PRIMARY KEY (\`device_location_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`route_coordinates\` (\`route_coordinates_id\` varchar(36) NOT NULL, \`center_latitude\` decimal(8,6) NOT NULL, \`center_longitude\` decimal(9,6) NOT NULL, \`latitude\` decimal(8,6) NOT NULL, \`longitude\` decimal(9,6) NOT NULL, \`sequence\` int NOT NULL, \`route_id\` char(36) NOT NULL, PRIMARY KEY (\`route_coordinates_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`collected_points\` (\`collected_point_id\` varchar(36) NOT NULL, \`push_timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`collected_timestamp\` timestamp NOT NULL, \`collection_point_id\` char(36) NULL, \`device_id\` char(36) NULL, PRIMARY KEY (\`collected_point_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`collection_points\` (\`collection_point_id\` varchar(36) NOT NULL, \`collection_point_name\` varchar(255) NOT NULL, \`latitude\` decimal(8,6) NOT NULL, \`longitude\` decimal(9,6) NOT NULL, \`route_id\` char(36) NOT NULL, UNIQUE INDEX \`IDX_981545a4c55bc6895bed6729cf\` (\`collection_point_name\`), PRIMARY KEY (\`collection_point_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`complaints\` (\`complaint_id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`latitude\` decimal(8,6) NOT NULL, \`longitude\` decimal(9,6) NOT NULL, \`push_timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`complaint_timestamp\` timestamp NOT NULL, \`image_id\` char(36) NOT NULL, \`device_id\` char(36) NOT NULL, UNIQUE INDEX \`IDX_0b8e8ed84e51e1f05a1cc3f710\` (\`title\`), UNIQUE INDEX \`IDX_e86f459cfbaac6e889856b69fe\` (\`description\`), PRIMARY KEY (\`complaint_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`image\` (\`image_id\` varchar(36) NOT NULL, \`image_url\` varchar(255) NOT NULL, \`file_name\` varchar(255) NOT NULL, \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active', \`route_id\` char(36) NOT NULL, PRIMARY KEY (\`image_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`route\` (\`route_id\` varchar(36) NOT NULL, \`route_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_5e2df1067075729388a504db02\` (\`route_name\`), PRIMARY KEY (\`route_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`device_route\` (\`device_route_id\` varchar(36) NOT NULL, \`day_assigned\` enum ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') NOT NULL, \`device_id\` char(36) NOT NULL, \`route_id\` char(36) NOT NULL, PRIMARY KEY (\`device_route_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`device\` (\`device_id\` varchar(36) NOT NULL, \`device_name\` varchar(255) NOT NULL, \`vehicle_plate_num\` varchar(255) NOT NULL, \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active', \`employee_id\` char(36) NOT NULL, PRIMARY KEY (\`device_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`user_id\` varchar(36) NOT NULL, \`role\` enum ('admin', 'garbage_collector') NOT NULL, \`employee_id\` char NOT NULL, \`username\` varchar(255) NOT NULL, \`hashed_password\` varchar(255) NOT NULL, \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active', UNIQUE INDEX \`REL_135936b6918bd375a4479b9231\` (\`employee_id\`), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`employee\` (\`employee_id\` varchar(36) NOT NULL, \`first_name\` varchar(255) NOT NULL, \`middle_name\` varchar(255) NULL, \`last_name\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`postal_code\` varchar(255) NULL, \`contact_number\` varchar(255) NOT NULL, \`emergency_contact\` varchar(255) NULL, \`email\` varchar(255) NOT NULL, \`age\` int NOT NULL, \`date_of_birth\` datetime NOT NULL, \`employment_start_date\` datetime NOT NULL, \`employee_number\` varchar(255) NULL, \`department\` varchar(255) NULL, \`position\` varchar(255) NULL, \`social_insurance_number\` varchar(255) NULL, \`my_number\` varchar(255) NULL, \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active', PRIMARY KEY (\`employee_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD CONSTRAINT \`FK_c822d6948bcf70a95527e46a96f\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` ADD CONSTRAINT \`FK_5d9fe0faeb6f5d8a9e8e66d3d9a\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_a120e9fc371ba4554a30df7671a\` FOREIGN KEY (\`collection_point_id\`) REFERENCES \`collection_points\`(\`collection_point_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_34af9ee456dea48a4ad2834aee8\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collection_points\` ADD CONSTRAINT \`FK_b05b0f7dfdc041e0bc9ec002d7a\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`complaints\` ADD CONSTRAINT \`FK_3b6e6f4afe741fffbc110a56146\` FOREIGN KEY (\`image_id\`) REFERENCES \`image\`(\`image_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`complaints\` ADD CONSTRAINT \`FK_896d93d839dd899c7060b0c24a9\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`image\` ADD CONSTRAINT \`FK_fba4d6e605bba1529ce9abaa24e\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_route\` ADD CONSTRAINT \`FK_250519789a36c7f5689440498ea\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_route\` ADD CONSTRAINT \`FK_a8723dd815781c1b6c58530eda4\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device\` ADD CONSTRAINT \`FK_b2ef775a0a71c156fcb7e8cc000\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_135936b6918bd375a4479b92311\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_135936b6918bd375a4479b92311\``);
        await queryRunner.query(`ALTER TABLE \`device\` DROP FOREIGN KEY \`FK_b2ef775a0a71c156fcb7e8cc000\``);
        await queryRunner.query(`ALTER TABLE \`device_route\` DROP FOREIGN KEY \`FK_a8723dd815781c1b6c58530eda4\``);
        await queryRunner.query(`ALTER TABLE \`device_route\` DROP FOREIGN KEY \`FK_250519789a36c7f5689440498ea\``);
        await queryRunner.query(`ALTER TABLE \`image\` DROP FOREIGN KEY \`FK_fba4d6e605bba1529ce9abaa24e\``);
        await queryRunner.query(`ALTER TABLE \`complaints\` DROP FOREIGN KEY \`FK_896d93d839dd899c7060b0c24a9\``);
        await queryRunner.query(`ALTER TABLE \`complaints\` DROP FOREIGN KEY \`FK_3b6e6f4afe741fffbc110a56146\``);
        await queryRunner.query(`ALTER TABLE \`collection_points\` DROP FOREIGN KEY \`FK_b05b0f7dfdc041e0bc9ec002d7a\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_34af9ee456dea48a4ad2834aee8\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_a120e9fc371ba4554a30df7671a\``);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` DROP FOREIGN KEY \`FK_5d9fe0faeb6f5d8a9e8e66d3d9a\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP FOREIGN KEY \`FK_c822d6948bcf70a95527e46a96f\``);
        await queryRunner.query(`DROP TABLE \`employee\``);
        await queryRunner.query(`DROP INDEX \`REL_135936b6918bd375a4479b9231\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`device\``);
        await queryRunner.query(`DROP TABLE \`device_route\``);
        await queryRunner.query(`DROP INDEX \`IDX_5e2df1067075729388a504db02\` ON \`route\``);
        await queryRunner.query(`DROP TABLE \`route\``);
        await queryRunner.query(`DROP TABLE \`image\``);
        await queryRunner.query(`DROP INDEX \`IDX_e86f459cfbaac6e889856b69fe\` ON \`complaints\``);
        await queryRunner.query(`DROP INDEX \`IDX_0b8e8ed84e51e1f05a1cc3f710\` ON \`complaints\``);
        await queryRunner.query(`DROP TABLE \`complaints\``);
        await queryRunner.query(`DROP INDEX \`IDX_981545a4c55bc6895bed6729cf\` ON \`collection_points\``);
        await queryRunner.query(`DROP TABLE \`collection_points\``);
        await queryRunner.query(`DROP TABLE \`collected_points\``);
        await queryRunner.query(`DROP TABLE \`route_coordinates\``);
        await queryRunner.query(`DROP TABLE \`device_location\``);
    }

}

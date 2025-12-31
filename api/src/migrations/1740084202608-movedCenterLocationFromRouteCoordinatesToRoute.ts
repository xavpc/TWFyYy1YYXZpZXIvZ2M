import { MigrationInterface, QueryRunner } from "typeorm";

export class MovedCenterLocationFromRouteCoordinatesToRoute1740084202608 implements MigrationInterface {
    name = 'MovedCenterLocationFromRouteCoordinatesToRoute1740084202608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` DROP COLUMN \`center_latitude\``);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` DROP COLUMN \`center_longitude\``);
        await queryRunner.query(`ALTER TABLE \`route\` ADD \`center_latitude\` decimal(8,6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`route\` ADD \`center_longitude\` decimal(9,6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_a120e9fc371ba4554a30df7671a\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_34af9ee456dea48a4ad2834aee8\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`collection_point_id\` \`collection_point_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`device_id\` \`device_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`postal_code\` \`postal_code\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`emergency_contact\` \`emergency_contact\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`employee_number\` \`employee_number\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`department\` \`department\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`position\` \`position\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`social_insurance_number\` \`social_insurance_number\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`my_number\` \`my_number\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_a120e9fc371ba4554a30df7671a\` FOREIGN KEY (\`collection_point_id\`) REFERENCES \`collection_points\`(\`collection_point_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_34af9ee456dea48a4ad2834aee8\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_34af9ee456dea48a4ad2834aee8\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_a120e9fc371ba4554a30df7671a\``);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`my_number\` \`my_number\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`social_insurance_number\` \`social_insurance_number\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`position\` \`position\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`department\` \`department\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`employee_number\` \`employee_number\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`emergency_contact\` \`emergency_contact\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`postal_code\` \`postal_code\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`device_id\` \`device_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`collection_point_id\` \`collection_point_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_34af9ee456dea48a4ad2834aee8\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_a120e9fc371ba4554a30df7671a\` FOREIGN KEY (\`collection_point_id\`) REFERENCES \`collection_points\`(\`collection_point_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`route\` DROP COLUMN \`center_longitude\``);
        await queryRunner.query(`ALTER TABLE \`route\` DROP COLUMN \`center_latitude\``);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` ADD \`center_longitude\` decimal(9,6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` ADD \`center_latitude\` decimal(8,6) NOT NULL`);
    }

}

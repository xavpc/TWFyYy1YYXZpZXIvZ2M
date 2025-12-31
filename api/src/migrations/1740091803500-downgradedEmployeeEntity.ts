import { MigrationInterface, QueryRunner } from "typeorm";

export class DowngradedEmployeeEntity1740091803500 implements MigrationInterface {
    name = 'DowngradedEmployeeEntity1740091803500'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`my_number\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`social_insurance_number\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`position\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`department\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`employee_number\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`employment_start_date\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`date_of_birth\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`emergency_contact\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`postal_code\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_a120e9fc371ba4554a30df7671a\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_34af9ee456dea48a4ad2834aee8\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`collection_point_id\` \`collection_point_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`device_id\` \`device_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_a120e9fc371ba4554a30df7671a\` FOREIGN KEY (\`collection_point_id\`) REFERENCES \`collection_points\`(\`collection_point_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_34af9ee456dea48a4ad2834aee8\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_34af9ee456dea48a4ad2834aee8\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_a120e9fc371ba4554a30df7671a\``);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL DEFAULT ''NULL''`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`device_id\` \`device_id\` char(36) NULL DEFAULT ''NULL''`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` CHANGE \`collection_point_id\` \`collection_point_id\` char(36) NULL DEFAULT ''NULL''`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_34af9ee456dea48a4ad2834aee8\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_a120e9fc371ba4554a30df7671a\` FOREIGN KEY (\`collection_point_id\`) REFERENCES \`collection_points\`(\`collection_point_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`postal_code\` varchar(255) NULL DEFAULT ''NULL''`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`emergency_contact\` varchar(255) NULL DEFAULT ''NULL''`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`date_of_birth\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`employment_start_date\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`employee_number\` varchar(255) NULL DEFAULT ''NULL''`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`department\` varchar(255) NULL DEFAULT ''NULL''`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`position\` varchar(255) NULL DEFAULT ''NULL''`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`social_insurance_number\` varchar(255) NULL DEFAULT ''NULL''`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`my_number\` varchar(255) NULL DEFAULT ''NULL''`);
    }

}

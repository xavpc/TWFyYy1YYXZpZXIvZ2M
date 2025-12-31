import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhancedEmployeeEntity1739250860325 implements MigrationInterface {
    name = 'EnhancedEmployeeEntity1739250860325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`first_name_kana\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`last_name_kana\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`postal_code\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`emergency_contact\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`date_of_birth\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`employment_start_date\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`employee_number\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`department\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`position\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`social_insurance_number\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`my_number\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`my_number\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`social_insurance_number\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`position\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`department\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`employee_number\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`employment_start_date\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`date_of_birth\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`emergency_contact\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`postal_code\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`last_name_kana\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`first_name_kana\``);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhancedEmployeeEntityFixedNames1739254505513 implements MigrationInterface {
    name = 'EnhancedEmployeeEntityFixedNames1739254505513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`first_name_kana\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`last_name_kana\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`last_name_kana\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`first_name_kana\` varchar(255) NOT NULL`);
    }

}

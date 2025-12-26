import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmployee1738109049427 implements MigrationInterface {
    name = 'CreateEmployee1738109049427'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`employee\` (\`employee_id\` CHAR(36) NOT NULL, \`first_name\` varchar(255) NOT NULL, \`middle_name\` varchar(255) NULL, \`last_name\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`contact_number\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`age\` int NOT NULL, PRIMARY KEY (\`employee_id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`employee\``);
    }

}

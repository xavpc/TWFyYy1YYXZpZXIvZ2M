import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDevice1738127535014 implements MigrationInterface {
    name = 'CreateDevice1738127535014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device\` ADD \`employee_id\` uuid NULL`);
        await queryRunner.query(`ALTER TABLE \`device\` ADD CONSTRAINT \`FK_b2ef775a0a71c156fcb7e8cc000\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device\` DROP FOREIGN KEY \`FK_b2ef775a0a71c156fcb7e8cc000\``);
        await queryRunner.query(`ALTER TABLE \`device\` DROP COLUMN \`employee_id\``);
    }

}

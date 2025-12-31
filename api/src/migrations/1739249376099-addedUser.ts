import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUser1739249376099 implements MigrationInterface {
    name = 'AddedUser1739249376099'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`user_id\` uuid NOT NULL, \`role\` enum ('admin', 'garbage_collector') NOT NULL, \`employee_id\` uuid NOT NULL, \`username\` varchar(255) NOT NULL, \`hashed_password\` varchar(255) NOT NULL, \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active', UNIQUE INDEX \`REL_135936b6918bd375a4479b9231\` (\`employee_id\`), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_135936b6918bd375a4479b92311\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_135936b6918bd375a4479b92311\``);
        await queryRunner.query(`DROP INDEX \`REL_135936b6918bd375a4479b9231\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}

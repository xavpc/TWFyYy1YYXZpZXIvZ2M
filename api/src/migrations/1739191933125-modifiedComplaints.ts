import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedComplaints1739191933125 implements MigrationInterface {
    name = 'ModifiedComplaints1739191933125'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`complaints\` ADD \`title\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`complaints\` ADD UNIQUE INDEX \`IDX_0b8e8ed84e51e1f05a1cc3f710\` (\`title\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`complaints\` DROP INDEX \`IDX_0b8e8ed84e51e1f05a1cc3f710\``);
        await queryRunner.query(`ALTER TABLE \`complaints\` DROP COLUMN \`title\``);
    }

}

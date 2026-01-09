import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyRoute1738304953092 implements MigrationInterface {
    name = 'ModifyRoute1738304953092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route\` ADD UNIQUE INDEX \`IDX_5e2df1067075729388a504db02\` (\`route_name\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route\` DROP INDEX \`IDX_5e2df1067075729388a504db02\``);
    }

}

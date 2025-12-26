import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedRoute21738212134324 implements MigrationInterface {
    name = 'AddedRoute21738212134324'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`route\` (\`route_id\` varchar(36) NOT NULL, \`route_name\` varchar(255) NOT NULL, PRIMARY KEY (\`route_id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`route\``);
    }

}

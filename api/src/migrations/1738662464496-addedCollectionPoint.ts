import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCollectionPoint1738662464496 implements MigrationInterface {
    name = 'AddedCollectionPoint1738662464496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`collection_points\` (\`collection_point_id\` uuid NOT NULL, \`collection_point_name\` varchar(255) NOT NULL, \`latitude\` decimal(8,6) NOT NULL, \`longitude\` decimal(9,6) NOT NULL, \`route_id\` uuid NULL, UNIQUE INDEX \`IDX_981545a4c55bc6895bed6729cf\` (\`collection_point_name\`), PRIMARY KEY (\`collection_point_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`collection_points\` ADD CONSTRAINT \`FK_b05b0f7dfdc041e0bc9ec002d7a\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`collection_points\` DROP FOREIGN KEY \`FK_b05b0f7dfdc041e0bc9ec002d7a\``);
        await queryRunner.query(`DROP INDEX \`IDX_981545a4c55bc6895bed6729cf\` ON \`collection_points\``);
        await queryRunner.query(`DROP TABLE \`collection_points\``);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedRouteCoordinates1738302072944 implements MigrationInterface {
    name = 'AddedRouteCoordinates1738302072944'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`route_coordinates\` (\`route_coordinates_id\` uuid NOT NULL, \`route_name\` varchar(255) NOT NULL, \`route_id\` uuid NULL, PRIMARY KEY (\`route_coordinates_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` ADD CONSTRAINT \`FK_5d9fe0faeb6f5d8a9e8e66d3d9a\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` DROP FOREIGN KEY \`FK_5d9fe0faeb6f5d8a9e8e66d3d9a\``);
        await queryRunner.query(`DROP TABLE \`route_coordinates\``);
    }

}

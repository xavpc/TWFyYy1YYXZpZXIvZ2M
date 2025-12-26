import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyRouteCoordinates1738303513428 implements MigrationInterface {
    name = 'ModifyRouteCoordinates1738303513428'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` DROP COLUMN \`route_name\``);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` ADD \`latitude\` decimal(8,6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` ADD \`longitude\` decimal(9,6) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` DROP COLUMN \`longitude\``);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` DROP COLUMN \`latitude\``);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` ADD \`route_name\` varchar(255) NOT NULL`);
    }

}

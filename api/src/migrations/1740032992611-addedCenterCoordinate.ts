import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCenterCoordinate1740032992611 implements MigrationInterface {
    name = 'AddedCenterCoordinate1740032992611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` ADD \`center_latitude\` decimal(8,6) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` ADD \`center_longitude\` decimal(9,6) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` DROP COLUMN \`center_longitude\``);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` DROP COLUMN \`center_latitude\``);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedSequenceToRouteCoordinates1739805546295 implements MigrationInterface {
    name = 'AddedSequenceToRouteCoordinates1739805546295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` ADD \`sequence\` int NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` DROP COLUMN \`sequence\``);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class custommigration implements MigrationInterface {
    name = 'custommigration'

    public async up(queryRunner: QueryRunner): Promise<void> {
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

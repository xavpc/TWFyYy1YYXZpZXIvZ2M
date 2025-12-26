import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCollectedPoints1738729445850 implements MigrationInterface {
    name = 'AddedCollectedPoints1738729445850'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`collected_points\` (\`collected_point_id\` uuid NOT NULL, \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`collection_point_id\` uuid NULL, \`device_id\` uuid NULL, PRIMARY KEY (\`collected_point_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_a120e9fc371ba4554a30df7671a\` FOREIGN KEY (\`collection_point_id\`) REFERENCES \`collection_points\`(\`collection_point_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collected_points\` ADD CONSTRAINT \`FK_34af9ee456dea48a4ad2834aee8\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_34af9ee456dea48a4ad2834aee8\``);
        await queryRunner.query(`ALTER TABLE \`collected_points\` DROP FOREIGN KEY \`FK_a120e9fc371ba4554a30df7671a\``);
        await queryRunner.query(`DROP TABLE \`collected_points\``);
    }

}

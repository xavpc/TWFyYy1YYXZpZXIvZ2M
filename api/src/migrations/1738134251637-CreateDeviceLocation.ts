import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDeviceLocation1738134251637 implements MigrationInterface {
    name = 'CreateDeviceLocation1738134251637'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`device_location\` (\`device_location_id\` uuid NOT NULL, \`latitude\` decimal(8,6) NOT NULL, \`longitude\` decimal(9,6) NOT NULL, \`timestamp\` datetime NOT NULL, \`sequence\` int NOT NULL, \`device_id\` uuid NULL, PRIMARY KEY (\`device_location_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD CONSTRAINT \`FK_c822d6948bcf70a95527e46a96f\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP FOREIGN KEY \`FK_c822d6948bcf70a95527e46a96f\``);
        await queryRunner.query(`DROP TABLE \`device_location\``);
    }

}

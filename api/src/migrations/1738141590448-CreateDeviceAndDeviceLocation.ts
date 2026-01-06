import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDeviceAndDeviceLocation1738141590448 implements MigrationInterface {
    name = 'CreateDeviceAndDeviceLocation1738141590448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`device_location\` (\`device_location_id\` CHAR(36) NOT NULL, \`latitude\` decimal(8,6) NOT NULL, \`longitude\` decimal(9,6) NOT NULL, \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`sequence\` int NOT NULL, \`device_id\` CHAR(36) NULL, UNIQUE INDEX \`IDX_SEQUENCE\` (\`sequence\`), UNIQUE INDEX \`IDX_eb5c5447b6b6d93e64740cf610\` (\`sequence\`), PRIMARY KEY (\`device_location_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`device\` (\`device_id\` CHAR(36) NOT NULL, \`device_name\` varchar(255) NOT NULL, \`vehicle_plate_num\` varchar(255) NOT NULL, \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active', \`employee_id\` CHAR(36) NULL, PRIMARY KEY (\`device_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD CONSTRAINT \`FK_c822d6948bcf70a95527e46a96f\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device\` ADD CONSTRAINT \`FK_b2ef775a0a71c156fcb7e8cc000\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device\` DROP FOREIGN KEY \`FK_b2ef775a0a71c156fcb7e8cc000\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP FOREIGN KEY \`FK_c822d6948bcf70a95527e46a96f\``);
        await queryRunner.query(`DROP TABLE \`device\``);
        await queryRunner.query(`DROP INDEX \`IDX_eb5c5447b6b6d93e64740cf610\` ON \`device_location\``);
        await queryRunner.query(`DROP INDEX \`IDX_SEQUENCE\` ON \`device_location\``);
        await queryRunner.query(`DROP TABLE \`device_location\``);
    }

}

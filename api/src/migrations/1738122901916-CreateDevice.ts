import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDevice1738122901916 implements MigrationInterface {
    name = 'CreateDevice1738122901916'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`device\` (\`device_id\` uuid NOT NULL, \`vehicle_plate_num\` varchar(255) NOT NULL, \`status\` varchar(255) NULL, PRIMARY KEY (\`device_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`employee_devices\` (\`employee_id\` uuid NOT NULL, \`device_id\` uuid NOT NULL, INDEX \`IDX_d5d3a44de6ea33fd232a7da774\` (\`employee_id\`), INDEX \`IDX_cf180f0bfa15c0d84dd4bd0695\` (\`device_id\`), PRIMARY KEY (\`employee_id\`, \`device_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`employee_devices\` ADD CONSTRAINT \`FK_d5d3a44de6ea33fd232a7da7748\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`employee_devices\` ADD CONSTRAINT \`FK_cf180f0bfa15c0d84dd4bd06950\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`employee_devices\` DROP FOREIGN KEY \`FK_cf180f0bfa15c0d84dd4bd06950\``);
        await queryRunner.query(`ALTER TABLE \`employee_devices\` DROP FOREIGN KEY \`FK_d5d3a44de6ea33fd232a7da7748\``);
        await queryRunner.query(`DROP INDEX \`IDX_cf180f0bfa15c0d84dd4bd0695\` ON \`employee_devices\``);
        await queryRunner.query(`DROP INDEX \`IDX_d5d3a44de6ea33fd232a7da774\` ON \`employee_devices\``);
        await queryRunner.query(`DROP TABLE \`employee_devices\``);
        await queryRunner.query(`DROP TABLE \`device\``);
    }

}

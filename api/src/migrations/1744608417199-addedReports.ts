import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedReports1744608417199 implements MigrationInterface {
    name = 'AddedReports1744608417199'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`reports\` (\`report_id\` varchar(36) NOT NULL, \`route_name\` varchar(255) NOT NULL, \`vehicle_plate_number\` varchar(50) NOT NULL, \`employee_name\` varchar(255) NOT NULL, \`remarks\` text NULL, \`session_start_time\` timestamp NOT NULL, \`session_end_time\` timestamp NOT NULL, \`session_id\` char(36) NOT NULL, UNIQUE INDEX \`REL_a38d50b0bf81ced11d7c025f31\` (\`session_id\`), PRIMARY KEY (\`report_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_9760615d88ed518196bb79ea03d\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`employee_id\` \`employee_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`end\` \`end\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_9760615d88ed518196bb79ea03d\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reports\` ADD CONSTRAINT \`FK_a38d50b0bf81ced11d7c025f316\` FOREIGN KEY (\`session_id\`) REFERENCES \`device_session\`(\`session_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reports\` DROP FOREIGN KEY \`FK_a38d50b0bf81ced11d7c025f316\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_9760615d88ed518196bb79ea03d\``);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`end\` \`end\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`employee_id\` \`employee_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_9760615d88ed518196bb79ea03d\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP INDEX \`REL_a38d50b0bf81ced11d7c025f31\` ON \`reports\``);
        await queryRunner.query(`DROP TABLE \`reports\``);
    }

}

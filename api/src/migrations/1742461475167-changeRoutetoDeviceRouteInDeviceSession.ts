import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeRoutetoDeviceRouteInDeviceSession1742461475167 implements MigrationInterface {
    name = 'ChangeRoutetoDeviceRouteInDeviceSession1742461475167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_session\` DROP FOREIGN KEY \`FK_c3d17b3aaf6e84b88576467520a\``);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`route_id\` \`device_route_id\` char(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_9760615d88ed518196bb79ea03d\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`employee_id\` \`employee_id\` char(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`end\` \`end\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_9760615d88ed518196bb79ea03d\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_session\` ADD CONSTRAINT \`FK_b12bb08b2df4aef515954ffe26b\` FOREIGN KEY (\`device_route_id\`) REFERENCES \`device_route\`(\`device_route_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_session\` DROP FOREIGN KEY \`FK_b12bb08b2df4aef515954ffe26b\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_9760615d88ed518196bb79ea03d\``);
        await queryRunner.query(`ALTER TABLE \`employee\` CHANGE \`middle_name\` \`middle_name\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`end\` \`end\` timestamp NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`employee_id\` \`employee_id\` char(36) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_9760615d88ed518196bb79ea03d\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_session\` CHANGE \`device_route_id\` \`route_id\` char(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`device_session\` ADD CONSTRAINT \`FK_c3d17b3aaf6e84b88576467520a\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

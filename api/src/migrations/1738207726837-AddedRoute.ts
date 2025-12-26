import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedRoute1738207726837 implements MigrationInterface {
    name = 'AddedRoute1738207726837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_location\` CHANGE \`sequence\` \`sequence\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`device_location\` CHANGE \`sequence\` \`sequence\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP COLUMN \`device_location_id\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD \`device_location_id\` varchar(36) NOT NULL PRIMARY KEY`);
        await queryRunner.query(`DROP INDEX \`IDX_eb5c5447b6b6d93e64740cf610\` ON \`device_location\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP COLUMN \`sequence\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD \`sequence\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_SEQUENCE\` ON \`device_location\` (\`sequence\`)`);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP FOREIGN KEY \`FK_c822d6948bcf70a95527e46a96f\``);
        await queryRunner.query(`ALTER TABLE \`device\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`device\` DROP COLUMN \`device_id\``);
        await queryRunner.query(`ALTER TABLE \`device\` ADD \`device_id\` varchar(36) NOT NULL PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`device\` DROP FOREIGN KEY \`FK_b2ef775a0a71c156fcb7e8cc000\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`employee_id\``);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`employee_id\` varchar(36) NOT NULL PRIMARY KEY`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_eb5c5447b6b6d93e64740cf610\` ON \`device_location\` (\`sequence\`)`);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD CONSTRAINT \`FK_c822d6948bcf70a95527e46a96f\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device\` ADD CONSTRAINT \`FK_b2ef775a0a71c156fcb7e8cc000\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device\` DROP FOREIGN KEY \`FK_b2ef775a0a71c156fcb7e8cc000\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP FOREIGN KEY \`FK_c822d6948bcf70a95527e46a96f\``);
        await queryRunner.query(`DROP INDEX \`IDX_eb5c5447b6b6d93e64740cf610\` ON \`device_location\``);
        await queryRunner.query(`ALTER TABLE \`employee\` DROP COLUMN \`employee_id\``);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD \`employee_id\` char(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`employee\` ADD PRIMARY KEY (\`employee_id\`)`);
        await queryRunner.query(`ALTER TABLE \`device\` ADD CONSTRAINT \`FK_b2ef775a0a71c156fcb7e8cc000\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device\` DROP COLUMN \`device_id\``);
        await queryRunner.query(`ALTER TABLE \`device\` ADD \`device_id\` char(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`device\` ADD PRIMARY KEY (\`device_id\`)`);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD CONSTRAINT \`FK_c822d6948bcf70a95527e46a96f\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP INDEX \`IDX_SEQUENCE\` ON \`device_location\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP COLUMN \`sequence\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD \`sequence\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_eb5c5447b6b6d93e64740cf610\` ON \`device_location\` (\`sequence\`)`);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP COLUMN \`device_location_id\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD \`device_location_id\` char(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`device_location\` CHANGE \`sequence\` \`sequence\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD PRIMARY KEY (\`device_location_id\`)`);
        await queryRunner.query(`ALTER TABLE \`device_location\` CHANGE \`sequence\` \`sequence\` int NOT NULL AUTO_INCREMENT`);
    }

}

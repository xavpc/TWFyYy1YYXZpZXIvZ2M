import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyAllForeignKeyForCascade1738737067600 implements MigrationInterface {
    name = 'ModifyAllForeignKeyForCascade1738737067600'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP FOREIGN KEY \`FK_c822d6948bcf70a95527e46a96f\``);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` DROP FOREIGN KEY \`FK_5d9fe0faeb6f5d8a9e8e66d3d9a\``);
        await queryRunner.query(`ALTER TABLE \`collection_points\` DROP FOREIGN KEY \`FK_b05b0f7dfdc041e0bc9ec002d7a\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` CHANGE \`device_id\` \`device_id\` uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` CHANGE \`route_id\` \`route_id\` uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`collection_points\` CHANGE \`route_id\` \`route_id\` uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`device\` DROP FOREIGN KEY \`FK_b2ef775a0a71c156fcb7e8cc000\``);
        await queryRunner.query(`ALTER TABLE \`device\` CHANGE \`employee_id\` \`employee_id\` uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD CONSTRAINT \`FK_c822d6948bcf70a95527e46a96f\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` ADD CONSTRAINT \`FK_5d9fe0faeb6f5d8a9e8e66d3d9a\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collection_points\` ADD CONSTRAINT \`FK_b05b0f7dfdc041e0bc9ec002d7a\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device\` ADD CONSTRAINT \`FK_b2ef775a0a71c156fcb7e8cc000\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device\` DROP FOREIGN KEY \`FK_b2ef775a0a71c156fcb7e8cc000\``);
        await queryRunner.query(`ALTER TABLE \`collection_points\` DROP FOREIGN KEY \`FK_b05b0f7dfdc041e0bc9ec002d7a\``);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` DROP FOREIGN KEY \`FK_5d9fe0faeb6f5d8a9e8e66d3d9a\``);
        await queryRunner.query(`ALTER TABLE \`device_location\` DROP FOREIGN KEY \`FK_c822d6948bcf70a95527e46a96f\``);
        await queryRunner.query(`ALTER TABLE \`device\` CHANGE \`employee_id\` \`employee_id\` uuid NULL`);
        await queryRunner.query(`ALTER TABLE \`device\` ADD CONSTRAINT \`FK_b2ef775a0a71c156fcb7e8cc000\` FOREIGN KEY (\`employee_id\`) REFERENCES \`employee\`(\`employee_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`collection_points\` CHANGE \`route_id\` \`route_id\` uuid NULL`);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` CHANGE \`route_id\` \`route_id\` uuid NULL`);
        await queryRunner.query(`ALTER TABLE \`device_location\` CHANGE \`device_id\` \`device_id\` uuid NULL`);
        await queryRunner.query(`ALTER TABLE \`collection_points\` ADD CONSTRAINT \`FK_b05b0f7dfdc041e0bc9ec002d7a\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`route_coordinates\` ADD CONSTRAINT \`FK_5d9fe0faeb6f5d8a9e8e66d3d9a\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_location\` ADD CONSTRAINT \`FK_c822d6948bcf70a95527e46a96f\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

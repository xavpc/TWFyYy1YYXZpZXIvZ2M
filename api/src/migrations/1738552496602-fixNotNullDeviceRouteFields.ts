import { MigrationInterface, QueryRunner } from "typeorm";

export class FixNotNullDeviceRouteFields1738552496602 implements MigrationInterface {
    name = 'FixNotNullDeviceRouteFields1738552496602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_route\` DROP FOREIGN KEY \`FK_250519789a36c7f5689440498ea\``);
        await queryRunner.query(`ALTER TABLE \`device_route\` DROP FOREIGN KEY \`FK_a8723dd815781c1b6c58530eda4\``);
        await queryRunner.query(`ALTER TABLE \`device_route\` CHANGE \`device_id\` \`device_id\` uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`device_route\` CHANGE \`route_id\` \`route_id\` uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`device_route\` ADD CONSTRAINT \`FK_250519789a36c7f5689440498ea\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_route\` ADD CONSTRAINT \`FK_a8723dd815781c1b6c58530eda4\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_route\` DROP FOREIGN KEY \`FK_a8723dd815781c1b6c58530eda4\``);
        await queryRunner.query(`ALTER TABLE \`device_route\` DROP FOREIGN KEY \`FK_250519789a36c7f5689440498ea\``);
        await queryRunner.query(`ALTER TABLE \`device_route\` CHANGE \`route_id\` \`route_id\` uuid NULL`);
        await queryRunner.query(`ALTER TABLE \`device_route\` CHANGE \`device_id\` \`device_id\` uuid NULL`);
        await queryRunner.query(`ALTER TABLE \`device_route\` ADD CONSTRAINT \`FK_a8723dd815781c1b6c58530eda4\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_route\` ADD CONSTRAINT \`FK_250519789a36c7f5689440498ea\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

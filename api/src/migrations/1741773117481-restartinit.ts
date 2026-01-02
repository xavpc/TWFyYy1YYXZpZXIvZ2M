import { MigrationInterface, QueryRunner } from "typeorm";

export class Restartinit1741773117481 implements MigrationInterface {
    name = 'Restartinit1741773117481'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`device_route\` (\`device_route_id\` varchar(36) NOT NULL, \`day_assigned\` enum ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') NOT NULL, \`device_id\` char(36) NOT NULL, \`route_id\` char(36) NOT NULL, UNIQUE INDEX \`IDX_e606bd98a6e5aa251617fde179\` (\`route_id\`, \`day_assigned\`), PRIMARY KEY (\`device_route_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`device_route\` ADD CONSTRAINT \`FK_250519789a36c7f5689440498ea\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`device_route\` ADD CONSTRAINT \`FK_a8723dd815781c1b6c58530eda4\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_route\` DROP FOREIGN KEY \`FK_a8723dd815781c1b6c58530eda4\``);
        await queryRunner.query(`ALTER TABLE \`device_route\` DROP FOREIGN KEY \`FK_250519789a36c7f5689440498ea\``);
        await queryRunner.query(`DROP INDEX \`IDX_e606bd98a6e5aa251617fde179\` ON \`device_route\``);
        await queryRunner.query(`DROP TABLE \`device_route\``);
    }

}

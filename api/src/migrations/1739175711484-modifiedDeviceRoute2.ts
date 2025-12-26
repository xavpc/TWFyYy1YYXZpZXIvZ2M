import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifiedDeviceRoute21739175711484 implements MigrationInterface {
    name = 'ModifiedDeviceRoute21739175711484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_route\` CHANGE \`status\` \`day_assigned\` enum ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`device_route\` CHANGE \`day_assigned\` \`status\` enum ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday') NOT NULL`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedComplaints1738834714693 implements MigrationInterface {
    name = 'AddedComplaints1738834714693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`image\` DROP FOREIGN KEY \`FK_fba4d6e605bba1529ce9abaa24e\``);
        await queryRunner.query(`CREATE TABLE \`complaints\` (\`complaint_id\` uuid NOT NULL, \`description\` varchar(255) NOT NULL, \`latitude\` decimal(8,6) NOT NULL, \`longitude\` decimal(9,6) NOT NULL, \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`image_id\` uuid NOT NULL, \`device_id\` uuid NOT NULL, UNIQUE INDEX \`IDX_e86f459cfbaac6e889856b69fe\` (\`description\`), PRIMARY KEY (\`complaint_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`image\` CHANGE \`route_id\` \`route_id\` uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`complaints\` ADD CONSTRAINT \`FK_3b6e6f4afe741fffbc110a56146\` FOREIGN KEY (\`image_id\`) REFERENCES \`image\`(\`image_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`complaints\` ADD CONSTRAINT \`FK_896d93d839dd899c7060b0c24a9\` FOREIGN KEY (\`device_id\`) REFERENCES \`device\`(\`device_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`image\` ADD CONSTRAINT \`FK_fba4d6e605bba1529ce9abaa24e\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`image\` DROP FOREIGN KEY \`FK_fba4d6e605bba1529ce9abaa24e\``);
        await queryRunner.query(`ALTER TABLE \`complaints\` DROP FOREIGN KEY \`FK_896d93d839dd899c7060b0c24a9\``);
        await queryRunner.query(`ALTER TABLE \`complaints\` DROP FOREIGN KEY \`FK_3b6e6f4afe741fffbc110a56146\``);
        await queryRunner.query(`ALTER TABLE \`image\` CHANGE \`route_id\` \`route_id\` uuid NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_e86f459cfbaac6e889856b69fe\` ON \`complaints\``);
        await queryRunner.query(`DROP TABLE \`complaints\``);
        await queryRunner.query(`ALTER TABLE \`image\` ADD CONSTRAINT \`FK_fba4d6e605bba1529ce9abaa24e\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

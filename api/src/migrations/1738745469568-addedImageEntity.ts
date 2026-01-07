import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedImageEntity1738745469568 implements MigrationInterface {
    name = 'AddedImageEntity1738745469568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`image\` (\`image_id\` uuid NOT NULL, \`image_url\` varchar(255) NOT NULL, \`file_name\` varchar(255) NOT NULL, \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active', \`route_id\` uuid NULL, PRIMARY KEY (\`image_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`image\` ADD CONSTRAINT \`FK_fba4d6e605bba1529ce9abaa24e\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`route_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`image\` DROP FOREIGN KEY \`FK_fba4d6e605bba1529ce9abaa24e\``);
        await queryRunner.query(`DROP TABLE \`image\``);
    }

}

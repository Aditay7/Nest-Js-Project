import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserDoctorPatientTables1752660091825 implements MigrationInterface {
    name = 'CreateUserDoctorPatientTables1752660091825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctors" ADD "password" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctors" DROP COLUMN "password"`);
    }

}

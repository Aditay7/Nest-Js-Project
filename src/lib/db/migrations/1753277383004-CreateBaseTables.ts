import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBaseTables1753277383004 implements MigrationInterface {
    name = 'CreateBaseTables1753277383004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "gender" character varying NOT NULL, "dob" date NOT NULL, "phone" character varying NOT NULL, "address" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "patient_details" ("user_id" integer NOT NULL, "medical_history" text NOT NULL, "blood_type" text NOT NULL, "height" text NOT NULL, "weight" text NOT NULL, "allergies" text NOT NULL, "notes" text NOT NULL, "current_medications" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f04f8be4b9e5f6bd4cf64e6cfe7" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "doctors" ("user_id" integer NOT NULL, "qualifications" character varying NOT NULL, "specialization" character varying NOT NULL, "years_of_experience" character varying NOT NULL, "bio" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_653c27d1b10652eb0c7bbbc4427" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`ALTER TABLE "patient_details" ADD CONSTRAINT "FK_f04f8be4b9e5f6bd4cf64e6cfe7" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD CONSTRAINT "FK_653c27d1b10652eb0c7bbbc4427" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctors" DROP CONSTRAINT "FK_653c27d1b10652eb0c7bbbc4427"`);
        await queryRunner.query(`ALTER TABLE "patient_details" DROP CONSTRAINT "FK_f04f8be4b9e5f6bd4cf64e6cfe7"`);
        await queryRunner.query(`DROP TABLE "doctors"`);
        await queryRunner.query(`DROP TABLE "patient_details"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}

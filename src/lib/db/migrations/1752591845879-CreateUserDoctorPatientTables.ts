import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserDoctorPatientTables1752591845879
  implements MigrationInterface
{
  name = 'CreateUserDoctorPatientTables1752591845879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "doctors" ("doctor_id" SERIAL NOT NULL, "name" character varying NOT NULL, "specialization" character varying NOT NULL, "years_of_experience" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "profile_pic" character varying NOT NULL, "bio" character varying NOT NULL, CONSTRAINT "PK_24821d9468276ddc40107fc0819" PRIMARY KEY ("doctor_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "patient_details" ("detail_id" SERIAL NOT NULL, "user_id" integer NOT NULL, "medical_history" text NOT NULL, "allergies" text NOT NULL, "notes" text NOT NULL, CONSTRAINT "PK_c08f62a497f8f2444ab1223aed4" PRIMARY KEY ("detail_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "gender" character varying NOT NULL, "dob" date NOT NULL, "phone" character varying NOT NULL, "address" character varying NOT NULL, CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "patient_details"`);
    await queryRunner.query(`DROP TABLE "doctors"`);
  }
}

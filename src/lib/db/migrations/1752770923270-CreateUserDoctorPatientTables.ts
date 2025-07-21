import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserDoctorPatientTables1752770923270 implements MigrationInterface {
    name = 'CreateUserDoctorPatientTables1752770923270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."appointments_status_enum" AS ENUM('booked', 'cancelled', 'rescheduled')`);
        await queryRunner.query(`CREATE TABLE "appointments" ("appointment_id" SERIAL NOT NULL, "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'booked', "slot_id" integer, "user_id" integer, "doctor_id" integer, CONSTRAINT "PK_dde485d1b7ca51845c075befb6b" PRIMARY KEY ("appointment_id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "gender" character varying NOT NULL, "dob" date NOT NULL, "phone" character varying NOT NULL, "address" character varying NOT NULL, CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "doctors" ("user_id" integer NOT NULL, "specialization" character varying NOT NULL, "years_of_experience" character varying NOT NULL, "profile_pic" character varying NOT NULL, "bio" character varying NOT NULL, CONSTRAINT "PK_653c27d1b10652eb0c7bbbc4427" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "slots" ("slot_id" SERIAL NOT NULL, "date" date NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "patients_per_slot" integer NOT NULL, "doctor_id" integer, CONSTRAINT "PK_7a16272977b74f83f126456cd82" PRIMARY KEY ("slot_id"))`);
        await queryRunner.query(`CREATE TABLE "patient_details" ("user_id" integer NOT NULL, "medical_history" text NOT NULL, "allergies" text NOT NULL, "notes" text NOT NULL, CONSTRAINT "PK_f04f8be4b9e5f6bd4cf64e6cfe7" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "availability" ("availability_id" SERIAL NOT NULL, "is_available" boolean NOT NULL, "day_of_week" character varying NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "doctor_id" integer, CONSTRAINT "PK_9cf7131c94627d1f8b30540d353" PRIMARY KEY ("availability_id"))`);
        await queryRunner.query(`CREATE TABLE "chats" ("chat_id" SERIAL NOT NULL, "message" text NOT NULL, "sender" character varying NOT NULL, "sent_at" TIMESTAMP NOT NULL, "user_id" integer, "doctor_id" integer, CONSTRAINT "PK_cb573d310bde330521e7715db2a" PRIMARY KEY ("chat_id"))`);
        await queryRunner.query(`CREATE TABLE "reschedule_request" ("reschedule_id" SERIAL NOT NULL, "old_date" date NOT NULL, "old_time" TIME NOT NULL, "new_date" date NOT NULL, "new_time" TIME NOT NULL, "rescheduled_at" TIMESTAMP NOT NULL, "appointment_id" integer, CONSTRAINT "PK_aa50eb3cb14675c027f5de5f59d" PRIMARY KEY ("reschedule_id"))`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_b1ccdd43ac8ccbb787c68a64a13" FOREIGN KEY ("slot_id") REFERENCES "slots"("slot_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_66dee3bea82328659a4db8e54b7" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctors" ADD CONSTRAINT "FK_653c27d1b10652eb0c7bbbc4427" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "slots" ADD CONSTRAINT "FK_e49d815e5bbd15b0f0a83c4b700" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_details" ADD CONSTRAINT "FK_f04f8be4b9e5f6bd4cf64e6cfe7" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "availability" ADD CONSTRAINT "FK_fc6c416f48a7d9349b9e4b17d6d" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chats" ADD CONSTRAINT "FK_b6c92d818d42e3e298e84d94414" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chats" ADD CONSTRAINT "FK_d5b345086d4a09ac98f527d7254" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reschedule_request" ADD CONSTRAINT "FK_2c5dc34ab1fb8bca3b68323df7c" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("appointment_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reschedule_request" DROP CONSTRAINT "FK_2c5dc34ab1fb8bca3b68323df7c"`);
        await queryRunner.query(`ALTER TABLE "chats" DROP CONSTRAINT "FK_d5b345086d4a09ac98f527d7254"`);
        await queryRunner.query(`ALTER TABLE "chats" DROP CONSTRAINT "FK_b6c92d818d42e3e298e84d94414"`);
        await queryRunner.query(`ALTER TABLE "availability" DROP CONSTRAINT "FK_fc6c416f48a7d9349b9e4b17d6d"`);
        await queryRunner.query(`ALTER TABLE "patient_details" DROP CONSTRAINT "FK_f04f8be4b9e5f6bd4cf64e6cfe7"`);
        await queryRunner.query(`ALTER TABLE "slots" DROP CONSTRAINT "FK_e49d815e5bbd15b0f0a83c4b700"`);
        await queryRunner.query(`ALTER TABLE "doctors" DROP CONSTRAINT "FK_653c27d1b10652eb0c7bbbc4427"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_4cf26c3f972d014df5c68d503d2"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_66dee3bea82328659a4db8e54b7"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_b1ccdd43ac8ccbb787c68a64a13"`);
        await queryRunner.query(`DROP TABLE "reschedule_request"`);
        await queryRunner.query(`DROP TABLE "chats"`);
        await queryRunner.query(`DROP TABLE "availability"`);
        await queryRunner.query(`DROP TABLE "patient_details"`);
        await queryRunner.query(`DROP TABLE "slots"`);
        await queryRunner.query(`DROP TABLE "doctors"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
    }

}

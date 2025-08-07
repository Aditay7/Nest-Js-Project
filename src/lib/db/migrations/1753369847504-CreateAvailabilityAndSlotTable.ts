import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAvailabilityAndSlotTable1753369847504 implements MigrationInterface {
    name = 'CreateAvailabilityAndSlotTable1753369847504'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "doctor_avail_override" ("id" SERIAL NOT NULL, "doctor_id" integer NOT NULL, "date" date NOT NULL, "startTime" character varying, "endTime" character varying, "isAvailable" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_8bf58832ff7b51606d4ad0c24af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "slots" ("id" SERIAL NOT NULL, "doctor_id" integer NOT NULL, "date" date NOT NULL, "startTime" character varying NOT NULL, "endTime" character varying NOT NULL, "capacity" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8b553bb1941663b63fd38405e42" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "doctor_availability" ("id" SERIAL NOT NULL, "doctor_id" integer NOT NULL, "dayOfWeek" integer NOT NULL, "startTime" character varying NOT NULL, "endTime" character varying NOT NULL, CONSTRAINT "PK_3d2b4ffe9085f8c7f9f269aed89" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "doctor_avail_override" ADD CONSTRAINT "FK_be750de7e3ab4c12c6f61e8782f" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "slots" ADD CONSTRAINT "FK_e49d815e5bbd15b0f0a83c4b700" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" ADD CONSTRAINT "FK_2cc8d37cdcb4ecd1e726d6ed304" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_availability" DROP CONSTRAINT "FK_2cc8d37cdcb4ecd1e726d6ed304"`);
        await queryRunner.query(`ALTER TABLE "slots" DROP CONSTRAINT "FK_e49d815e5bbd15b0f0a83c4b700"`);
        await queryRunner.query(`ALTER TABLE "doctor_avail_override" DROP CONSTRAINT "FK_be750de7e3ab4c12c6f61e8782f"`);
        await queryRunner.query(`DROP TABLE "doctor_availability"`);
        await queryRunner.query(`DROP TABLE "slots"`);
        await queryRunner.query(`DROP TABLE "doctor_avail_override"`);
    }

}

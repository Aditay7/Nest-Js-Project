import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAvailabilityWithEnumsAndSoftDelete1753370000000
  implements MigrationInterface
{
  name = 'UpdateAvailabilityWithEnumsAndSoftDelete1753370000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(
      `CREATE TYPE "public"."session_type_enum" AS ENUM('morning', 'afternoon', 'evening', 'custom')`,
    );

    // Update doctor_availability table - handle existing data carefully
    // First add the new column as nullable
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" ADD "daysOfWeek" text`,
    );

    // Migrate existing data: convert dayOfWeek to daysOfWeek array
    await queryRunner.query(
      `UPDATE "doctor_availability" SET "daysOfWeek" = '[' || "dayOfWeek" || ']' WHERE "daysOfWeek" IS NULL`,
    );

    // Now make it NOT NULL
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" ALTER COLUMN "daysOfWeek" SET NOT NULL`,
    );

    // Drop the old column
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" DROP COLUMN "dayOfWeek"`,
    );

    // Add other new columns
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" ADD "sessionType" "public"."session_type_enum" NOT NULL DEFAULT 'custom'`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );

    // Update doctor_avail_override table
    await queryRunner.query(
      `ALTER TABLE "doctor_avail_override" DROP COLUMN "sessionType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_avail_override" ADD "sessionType" "public"."session_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_avail_override" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_avail_override" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_avail_override" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );

    // Update slots table
    await queryRunner.query(
      `ALTER TABLE "slots" ADD "sessionType" "public"."session_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "slots" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert slots table
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN "isActive"`);
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN "sessionType"`);

    // Revert doctor_avail_override table
    await queryRunner.query(
      `ALTER TABLE "doctor_avail_override" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_avail_override" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_avail_override" DROP COLUMN "isActive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_avail_override" DROP COLUMN "sessionType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_avail_override" ADD "sessionType" character varying`,
    );

    // Revert doctor_availability table - handle data transformation
    // Add the old column first
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" ADD "dayOfWeek" integer`,
    );

    // Convert daysOfWeek array back to single dayOfWeek (take first element)
    await queryRunner.query(
      `UPDATE "doctor_availability" SET "dayOfWeek" = CAST(SUBSTRING("daysOfWeek" FROM 2 FOR 1) AS INTEGER) WHERE "dayOfWeek" IS NULL`,
    );

    // Make it NOT NULL
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" ALTER COLUMN "dayOfWeek" SET NOT NULL`,
    );

    // Drop new columns
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" DROP COLUMN "isActive"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" DROP COLUMN "sessionType"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" DROP COLUMN "daysOfWeek"`,
    );

    // Drop enum type
    await queryRunner.query(`DROP TYPE "public"."session_type_enum"`);
  }
}

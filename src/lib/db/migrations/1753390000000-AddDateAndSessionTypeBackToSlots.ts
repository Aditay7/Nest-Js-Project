import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDateAndSessionTypeBackToSlots1753390000000
  implements MigrationInterface
{
  name = 'AddDateAndSessionTypeBackToSlots1753390000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add date column back to slots table
    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'slots' AND column_name = 'date'
        ) THEN
          ALTER TABLE "slots" ADD "date" date NOT NULL DEFAULT '2024-01-01';
        END IF;
      END $$;
    `);

    // Add sessionType column back to slots table
    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'slots' AND column_name = 'sessionType'
        ) THEN
          ALTER TABLE "slots" ADD "sessionType" "public"."session_type_enum" NOT NULL DEFAULT 'custom';
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the columns we added
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN IF EXISTS "date"`);
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN IF EXISTS "sessionType"`);
  }
}

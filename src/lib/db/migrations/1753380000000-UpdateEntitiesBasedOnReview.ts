import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEntitiesBasedOnReview1753380000000
  implements MigrationInterface
{
  name = 'UpdateEntitiesBasedOnReview1753380000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Remove date column from slots table (as per review feedback)
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN IF EXISTS "date"`);

    // 2. Remove sessionType column from slots table (as per review feedback)
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN IF EXISTS "sessionType"`);

    // 3. Remove elastic metadata columns from slots table (if they exist)
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN IF EXISTS "elasticMetadata"`);
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN IF EXISTS "createdByExpansion"`);
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN IF EXISTS "originalSlotId"`);
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN IF EXISTS "expansionReason"`);
    await queryRunner.query(`ALTER TABLE "slots" DROP COLUMN IF EXISTS "expansionType"`);

    // 4. Ensure slots table has the correct structure
    // Add isActive if it doesn't exist (should already exist from previous migration)
    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'slots' AND column_name = 'isActive'
        ) THEN
          ALTER TABLE "slots" ADD "isActive" boolean NOT NULL DEFAULT true;
        END IF;
      END $$;
    `);

    // 5. Add date column to doctor_availability table (as per review feedback)
    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'doctor_availability' AND column_name = 'date'
        ) THEN
          ALTER TABLE "doctor_availability" ADD "date" date;
        END IF;
      END $$;
    `);

    // 6. Ensure doctor_availability has all required columns
    // Add sessionType if it doesn't exist
    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'doctor_availability' AND column_name = 'sessionType'
        ) THEN
          ALTER TABLE "doctor_availability" ADD "sessionType" "public"."session_type_enum" NOT NULL DEFAULT 'custom';
        END IF;
      END $$;
    `);

    // Add isActive if it doesn't exist
    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'doctor_availability' AND column_name = 'isActive'
        ) THEN
          ALTER TABLE "doctor_availability" ADD "isActive" boolean NOT NULL DEFAULT true;
        END IF;
      END $$;
    `);

    // Add createdAt if it doesn't exist
    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'doctor_availability' AND column_name = 'createdAt'
        ) THEN
          ALTER TABLE "doctor_availability" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now();
        END IF;
      END $$;
    `);

    // Add updatedAt if it doesn't exist
    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'doctor_availability' AND column_name = 'updatedAt'
        ) THEN
          ALTER TABLE "doctor_availability" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now();
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes - add back removed columns to slots
    await queryRunner.query(`ALTER TABLE "slots" ADD "date" date`);
    await queryRunner.query(`ALTER TABLE "slots" ADD "sessionType" "public"."session_type_enum"`);

    // Remove date column from doctor_availability
    await queryRunner.query(`ALTER TABLE "doctor_availability" DROP COLUMN IF EXISTS "date"`);

    // Note: We don't restore elastic metadata as it was removed intentionally
  }
}

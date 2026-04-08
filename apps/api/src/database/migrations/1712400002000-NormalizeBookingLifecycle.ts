import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeBookingLifecycle1712400002000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Swap bookings.booking_status to new canonical enum with data migration.
    await queryRunner.query(`
      CREATE TYPE "bookings_booking_status_enum_new" AS ENUM (
        'pending','assigned','accepted','in_progress',
        'completed','cancelled','rejected'
      );
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings"
      ALTER COLUMN "booking_status" DROP DEFAULT;
    `);

    await queryRunner.query(`
      ALTER TABLE "bookings"
      ALTER COLUMN "booking_status" TYPE "bookings_booking_status_enum_new"
      USING (
        CASE "booking_status"::text
          WHEN 'Pending' THEN 'pending'
          WHEN 'Confirmed' THEN 'accepted'
          WHEN 'In Progress' THEN 'in_progress'
          WHEN 'Completed' THEN 'completed'
          WHEN 'Cancelled' THEN 'cancelled'
          ELSE 'pending'
        END
      )::"bookings_booking_status_enum_new";
    `);

    await queryRunner.query(
      `DROP TYPE IF EXISTS "bookings_booking_status_enum";`,
    );
    await queryRunner.query(`
      ALTER TYPE "bookings_booking_status_enum_new"
      RENAME TO "bookings_booking_status_enum";
    `);
    await queryRunner.query(`
      ALTER TABLE "bookings"
      ALTER COLUMN "booking_status" SET DEFAULT 'pending';
    `);

    // Add vendor_id + timestamp columns
    await queryRunner.query(`
      ALTER TABLE "bookings"
      ADD COLUMN IF NOT EXISTS "vendor_id" uuid NULL
        REFERENCES "vendors"("id") ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS "assigned_at" TIMESTAMPTZ NULL,
      ADD COLUMN IF NOT EXISTS "accepted_at" TIMESTAMPTZ NULL,
      ADD COLUMN IF NOT EXISTS "started_at" TIMESTAMPTZ NULL,
      ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMPTZ NULL,
      ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMPTZ NULL;
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_bookings_vendor_status"
      ON "bookings" ("vendor_id", "booking_status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_bookings_vendor_status";`,
    );
    await queryRunner.query(`
      ALTER TABLE "bookings"
      DROP COLUMN IF EXISTS "cancelled_at",
      DROP COLUMN IF EXISTS "completed_at",
      DROP COLUMN IF EXISTS "started_at",
      DROP COLUMN IF EXISTS "accepted_at",
      DROP COLUMN IF EXISTS "assigned_at",
      DROP COLUMN IF EXISTS "vendor_id";
    `);
  }
}

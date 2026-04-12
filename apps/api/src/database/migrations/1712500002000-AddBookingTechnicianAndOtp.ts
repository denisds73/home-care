import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBookingTechnicianAndOtp1712500002000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "bookings"
      ADD COLUMN IF NOT EXISTS "technician_id" uuid NULL
        REFERENCES "technicians"("id") ON DELETE SET NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE "bookings"
      ADD COLUMN IF NOT EXISTS "completion_otp" varchar(6) NULL;
    `);
    await queryRunner.query(`
      ALTER TABLE "bookings"
      ADD COLUMN IF NOT EXISTS "completion_otp_expires_at" TIMESTAMP WITH TIME ZONE NULL;
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_bookings_technician_status"
      ON "bookings" ("technician_id", "booking_status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_bookings_technician_status";`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN IF EXISTS "completion_otp_expires_at";`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN IF EXISTS "completion_otp";`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP COLUMN IF EXISTS "technician_id";`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPartnerArtifacts1712400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop bookings.partner_id FK + column if present
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'bookings' AND column_name = 'partner_id'
        ) THEN
          ALTER TABLE "bookings" DROP COLUMN "partner_id";
        END IF;
      END $$;
    `);

    // Drop notifications.partner_id if present
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'notifications' AND column_name = 'partner_id'
        ) THEN
          ALTER TABLE "notifications" DROP COLUMN "partner_id";
        END IF;
      END $$;
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "jobs" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payout_requests" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "partners" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wallet" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wallets" CASCADE;`);

    await queryRunner.query(`DROP TYPE IF EXISTS "jobs_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "partners_status_enum";`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "payout_requests_status_enum";`,
    );
  }

  public async down(): Promise<void> {
    // Non-reversible: partner infrastructure is intentionally removed.
  }
}

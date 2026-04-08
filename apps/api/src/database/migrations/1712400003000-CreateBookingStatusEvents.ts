import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingStatusEvents1712400003000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "booking_status_events" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL
          REFERENCES "bookings"("booking_id") ON DELETE CASCADE,
        "from_status" text NULL,
        "to_status" text NOT NULL,
        "event" text NOT NULL,
        "actor_user_id" uuid NOT NULL
          REFERENCES "users"("id"),
        "actor_role" text NOT NULL,
        "note" text NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_booking_status_events_booking_created"
      ON "booking_status_events" ("booking_id", "created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_booking_status_events_booking_created";`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_status_events";`);
  }
}

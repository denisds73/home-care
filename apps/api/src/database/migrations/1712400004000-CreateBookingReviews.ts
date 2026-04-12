import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingReviews1712400004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "booking_reviews" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "booking_id" uuid NOT NULL UNIQUE
          REFERENCES "bookings"("booking_id") ON DELETE CASCADE,
        "customer_id" uuid NOT NULL REFERENCES "users"("id"),
        "vendor_id" uuid NOT NULL REFERENCES "vendors"("id"),
        "rating" smallint NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
        "comment" text NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_booking_reviews_vendor"
      ON "booking_reviews" ("vendor_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_booking_reviews_vendor";`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_reviews";`);
  }
}

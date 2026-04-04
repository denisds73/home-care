import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Seeds 3 demo users (customer, partner, admin) and a partner profile.
 * Password for all: "demo123" (bcrypt 12 rounds)
 */
export class SeedDemoUsers1712200002000 implements MigrationInterface {
  private readonly PASSWORD_HASH =
    '$2b$12$nPHfuH44c0TYZL4g14zDZOAvkA9shPiFyihcFv9vt/M1GaYwRvn6S';

  // Fixed UUIDs for reproducibility
  private readonly CUSTOMER_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
  private readonly PARTNER_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
  private readonly ADMIN_ID = 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f';
  private readonly PARTNER_PROFILE_ID = 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert demo users
    await queryRunner.query(`
      INSERT INTO "users" ("id", "name", "email", "password_hash", "phone", "role", "status")
      VALUES
        (
          '${this.CUSTOMER_ID}',
          'Demo Customer',
          'demo@customer.com',
          '${this.PASSWORD_HASH}',
          '+919876543210',
          'customer',
          'active'
        ),
        (
          '${this.PARTNER_ID}',
          'Demo Partner',
          'demo@partner.com',
          '${this.PASSWORD_HASH}',
          '+919876543211',
          'partner',
          'active'
        ),
        (
          '${this.ADMIN_ID}',
          'Demo Admin',
          'demo@admin.com',
          '${this.PASSWORD_HASH}',
          '+919876543212',
          'admin',
          'active'
        )
      ON CONFLICT ("email") DO NOTHING;
    `);

    // Insert partner profile for the partner user
    await queryRunner.query(`
      INSERT INTO "partners" ("id", "user_id", "skills", "rating", "completed_jobs", "service_area", "is_online", "earnings", "status")
      VALUES
        (
          '${this.PARTNER_PROFILE_ID}',
          '${this.PARTNER_ID}',
          '{ac,tv,refrigerator}',
          4.50,
          42,
          'Mumbai, Maharashtra',
          true,
          28500.00,
          'approved'
        )
      ON CONFLICT ("user_id") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "partners" WHERE "user_id" = '${this.PARTNER_ID}';
    `);
    await queryRunner.query(`
      DELETE FROM "users"
      WHERE "email" IN ('demo@customer.com', 'demo@partner.com', 'demo@admin.com');
    `);
  }
}

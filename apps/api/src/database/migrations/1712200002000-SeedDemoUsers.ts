import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Seeds demo users: customer, vendor, admin.
 * Password for all: "demo123" (bcrypt 12 rounds)
 */
export class SeedDemoUsers1712200002000 implements MigrationInterface {
  private readonly PASSWORD_HASH =
    '$2b$12$nPHfuH44c0TYZL4g14zDZOAvkA9shPiFyihcFv9vt/M1GaYwRvn6S';

  private readonly CUSTOMER_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
  private readonly VENDOR_USER_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
  private readonly ADMIN_ID = 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "users" ("id", "name", "email", "password_hash", "phone", "role", "status")
      VALUES
        ('${this.CUSTOMER_ID}', 'Demo Customer', 'demo@customer.com', '${this.PASSWORD_HASH}', '+919876543210', 'customer', 'active'),
        ('${this.VENDOR_USER_ID}', 'Demo Vendor', 'demo@vendor.com', '${this.PASSWORD_HASH}', '+919876543211', 'customer', 'active'),
        ('${this.ADMIN_ID}', 'Demo Admin', 'demo@admin.com', '${this.PASSWORD_HASH}', '+919876543212', 'admin', 'active')
      ON CONFLICT ("email") DO NOTHING;
    `);
    // Note: vendor role is applied in the AddVendorUserLink migration
    // once the enum value exists; we upgrade demo vendor user there.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "users"
      WHERE "email" IN ('demo@customer.com', 'demo@vendor.com', 'demo@admin.com');
    `);
  }
}

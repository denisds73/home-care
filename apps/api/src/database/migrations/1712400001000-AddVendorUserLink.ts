import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVendorUserLink1712400001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'vendor' to users_role_enum if not present
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumtypid = 'users_role_enum'::regtype
            AND enumlabel = 'vendor'
        ) THEN
          ALTER TYPE "users_role_enum" ADD VALUE 'vendor';
        END IF;
      END $$;
    `);

    // Migrate any existing partner-role users to vendor
    await queryRunner.query(`
      UPDATE "users" SET "role" = 'vendor' WHERE "role" = 'partner';
    `);

    // Note: Postgres cannot easily drop a value from an enum. We leave
    // 'partner' unused in the enum; application-level Role no longer uses it.

    // Add users.vendor_id column + FK
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "vendor_id" uuid NULL
        REFERENCES "vendors"("id") ON DELETE SET NULL;
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_users_vendor_id" ON "users" ("vendor_id");
    `);

    // Seed a demo vendor and link the demo vendor user
    await queryRunner.query(`
      INSERT INTO "vendors" (
        "id", "company_name", "contact_number", "email", "city",
        "pin_codes", "gst_number", "gst_verified", "status"
      ) VALUES (
        'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80',
        'Demo Vendor Co', '+919876543211', 'vendor-co@demo.com',
        'Mumbai', '["400001"]'::jsonb, '27AAAAA0000A1Z5', true, 'active'
      ) ON CONFLICT ("email") DO NOTHING;
    `);
    await queryRunner.query(`
      UPDATE "users"
      SET "role" = 'vendor',
          "vendor_id" = 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'
      WHERE "email" = 'demo@vendor.com';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_users_vendor_id";`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "vendor_id";`,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVendorUserLink1712400001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rebuild users_role_enum: drop 'partner', add 'vendor'.
    // Postgres forbids using a freshly-added enum value inside the same
    // transaction (error 55P04), so we recreate the type instead of
    // ALTER TYPE ... ADD VALUE. This also cleanly removes the dormant
    // 'partner' value.
    await queryRunner.query(`
      ALTER TYPE "users_role_enum" RENAME TO "users_role_enum_old";
    `);
    await queryRunner.query(`
      CREATE TYPE "users_role_enum" AS ENUM ('customer', 'vendor', 'admin');
    `);
    // Migrate existing partner users → vendor while switching column type.
    await queryRunner.query(`
      ALTER TABLE "users"
        ALTER COLUMN "role" DROP DEFAULT,
        ALTER COLUMN "role" TYPE "users_role_enum"
          USING (
            CASE "role"::text
              WHEN 'partner' THEN 'vendor'
              ELSE "role"::text
            END
          )::"users_role_enum",
        ALTER COLUMN "role" SET DEFAULT 'customer';
    `);
    await queryRunner.query(`DROP TYPE "users_role_enum_old";`);

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

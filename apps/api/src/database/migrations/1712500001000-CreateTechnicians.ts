import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTechnicians1712500001000 implements MigrationInterface {
  // Reuse EXACT bcrypt hash from SeedDemoUsers so 'demo123' works.
  private readonly PASSWORD_HASH =
    '$2b$12$nPHfuH44c0TYZL4g14zDZOAvkA9shPiFyihcFv9vt/M1GaYwRvn6S';

  private readonly DEMO_VENDOR_ID = 'd4e5f6a7-b8c9-4d0e-9f2a-3b4c5d6e7f80';
  private readonly DEMO_TECHNICIAN_ID =
    'e5f6a7b8-c9d0-4e1f-8a3b-4c5d6e7f8091';
  private readonly DEMO_TECH_USER_ID =
    'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f809102';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "technicians_status_enum" AS ENUM ('active','inactive','on_leave');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "technicians" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "vendor_id" uuid NOT NULL REFERENCES "vendors"("id") ON DELETE CASCADE,
        "full_name" varchar(120) NOT NULL,
        "phone" varchar(20) NOT NULL,
        "email" varchar(120) NOT NULL UNIQUE,
        "skills" jsonb NOT NULL DEFAULT '[]',
        "status" "technicians_status_enum" NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_technicians_vendor_status"
      ON "technicians" ("vendor_id", "status");
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "technician_id" uuid NULL UNIQUE
        REFERENCES "technicians"("id") ON DELETE SET NULL;
    `);

    // Seed demo technician
    await queryRunner.query(`
      INSERT INTO "technicians" (
        "id", "vendor_id", "full_name", "phone", "email", "skills", "status"
      ) VALUES (
        '${this.DEMO_TECHNICIAN_ID}',
        '${this.DEMO_VENDOR_ID}',
        'Demo Technician',
        '+919876543213',
        'tech@demo.com',
        '["plumbing","electrical"]'::jsonb,
        'active'
      ) ON CONFLICT ("email") DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO "users" (
        "id", "name", "email", "password_hash", "phone", "role", "status", "vendor_id", "technician_id"
      ) VALUES (
        '${this.DEMO_TECH_USER_ID}',
        'Demo Technician',
        'tech@demo.com',
        '${this.PASSWORD_HASH}',
        '+919876543213',
        'technician',
        'active',
        '${this.DEMO_VENDOR_ID}',
        '${this.DEMO_TECHNICIAN_ID}'
      ) ON CONFLICT ("email") DO NOTHING;
    `);

    await queryRunner.query(`
      UPDATE "users"
      SET "technician_id" = '${this.DEMO_TECHNICIAN_ID}',
          "vendor_id" = '${this.DEMO_VENDOR_ID}',
          "role" = 'technician'
      WHERE "email" = 'tech@demo.com';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "users" WHERE "email" = 'tech@demo.com';
    `);
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "technician_id";
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_technicians_vendor_status";
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "technicians";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "technicians_status_enum";`);
  }
}

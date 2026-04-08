import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVendors1712300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "vendors_status_enum" AS ENUM ('pending','active','suspended','rejected');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendors" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "company_name" varchar(200) NOT NULL,
        "contact_number" varchar(20) NOT NULL,
        "email" varchar(255) NOT NULL UNIQUE,
        "city" varchar(100) NOT NULL,
        "pin_codes" jsonb NOT NULL DEFAULT '[]',
        "gst_number" varchar(15) NOT NULL UNIQUE,
        "gst_verified" boolean NOT NULL DEFAULT false,
        "status" "vendors_status_enum" NOT NULL DEFAULT 'pending',
        "onboarded_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vendor_categories" (
        "vendor_id" uuid NOT NULL REFERENCES "vendors"("id") ON DELETE CASCADE,
        "category_id" varchar(50) NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
        PRIMARY KEY ("vendor_id", "category_id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "vendor_categories";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "vendors";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "vendors_status_enum";`);
  }
}

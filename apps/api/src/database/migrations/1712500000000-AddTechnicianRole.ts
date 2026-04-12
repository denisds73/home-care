import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rebuild users_role_enum to include 'technician'.
 * Postgres forbids using a freshly-added enum value inside the same
 * transaction (error 55P04), so we recreate the type following the
 * same pattern used in AddVendorUserLink.
 */
export class AddTechnicianRole1712500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "users_role_enum" RENAME TO "users_role_enum_old";
    `);
    await queryRunner.query(`
      CREATE TYPE "users_role_enum" AS ENUM ('customer', 'vendor', 'technician', 'admin');
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
        ALTER COLUMN "role" DROP DEFAULT,
        ALTER COLUMN "role" TYPE "users_role_enum"
          USING ("role"::text::"users_role_enum"),
        ALTER COLUMN "role" SET DEFAULT 'customer';
    `);
    await queryRunner.query(`DROP TYPE "users_role_enum_old";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "users_role_enum" RENAME TO "users_role_enum_old";
    `);
    await queryRunner.query(`
      CREATE TYPE "users_role_enum" AS ENUM ('customer', 'vendor', 'admin');
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
        ALTER COLUMN "role" DROP DEFAULT,
        ALTER COLUMN "role" TYPE "users_role_enum"
          USING (
            CASE "role"::text
              WHEN 'technician' THEN 'customer'
              ELSE "role"::text
            END
          )::"users_role_enum",
        ALTER COLUMN "role" SET DEFAULT 'customer';
    `);
    await queryRunner.query(`DROP TYPE "users_role_enum_old";`);
  }
}

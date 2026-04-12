import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Ensures every onboarded vendor has a linked auth user account.
 * Demo password for newly-created vendor users: "demo123"
 */
export class BackfillVendorAuthUsers1712600001000 implements MigrationInterface {
  private readonly PASSWORD_HASH =
    '$2b$12$nPHfuH44c0TYZL4g14zDZOAvkA9shPiFyihcFv9vt/M1GaYwRvn6S';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Link existing users to vendors by matching email.
    await queryRunner.query(`
      UPDATE "users" u
      SET "role" = 'vendor',
          "vendor_id" = v."id"
      FROM "vendors" v
      WHERE u."email" = v."email"
        AND (u."vendor_id" IS NULL OR u."vendor_id" <> v."id");
    `);

    // Create missing vendor auth users for vendors that do not have one.
    await queryRunner.query(`
      INSERT INTO "users" (
        "id",
        "name",
        "email",
        "password_hash",
        "phone",
        "role",
        "status",
        "vendor_id"
      )
      SELECT
        uuid_generate_v4(),
        v."company_name",
        v."email",
        '${this.PASSWORD_HASH}',
        v."contact_number",
        'vendor',
        'active',
        v."id"
      FROM "vendors" v
      LEFT JOIN "users" u ON u."email" = v."email"
      WHERE u."id" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove users created by this migration signature (default demo password + role).
    await queryRunner.query(`
      DELETE FROM "users" u
      USING "vendors" v
      WHERE u."email" = v."email"
        AND u."role" = 'vendor'
        AND u."password_hash" = '${this.PASSWORD_HASH}'
        AND u."vendor_id" = v."id";
    `);
  }
}

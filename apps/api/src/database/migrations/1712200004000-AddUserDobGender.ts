import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserDobGender1712200004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "gender_enum" AS ENUM ('male', 'female', 'other');
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "dob" date,
        ADD COLUMN IF NOT EXISTS "gender" "gender_enum";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "gender",
        DROP COLUMN IF EXISTS "dob";
    `);
    await queryRunner.query(`DROP TYPE IF EXISTS "gender_enum";`);
  }
}

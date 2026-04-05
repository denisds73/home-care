import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExpandServiceModel1712200003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "services"
        ADD COLUMN IF NOT EXISTS "long_description" text,
        ADD COLUMN IF NOT EXISTS "original_price" decimal(10,2),
        ADD COLUMN IF NOT EXISTS "image_url" varchar(500),
        ADD COLUMN IF NOT EXISTS "estimated_duration" varchar(50),
        ADD COLUMN IF NOT EXISTS "inclusions" jsonb DEFAULT '[]' NOT NULL,
        ADD COLUMN IF NOT EXISTS "exclusions" jsonb DEFAULT '[]' NOT NULL,
        ADD COLUMN IF NOT EXISTS "faqs" jsonb DEFAULT '[]' NOT NULL,
        ADD COLUMN IF NOT EXISTS "rating_average" decimal(2,1) DEFAULT 0 NOT NULL,
        ADD COLUMN IF NOT EXISTS "rating_count" int DEFAULT 0 NOT NULL,
        ADD COLUMN IF NOT EXISTS "rating_distribution" jsonb DEFAULT '[0,0,0,0,0]' NOT NULL,
        ADD COLUMN IF NOT EXISTS "sort_order" int DEFAULT 0 NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "services"
        DROP COLUMN IF EXISTS "long_description",
        DROP COLUMN IF EXISTS "original_price",
        DROP COLUMN IF EXISTS "image_url",
        DROP COLUMN IF EXISTS "estimated_duration",
        DROP COLUMN IF EXISTS "inclusions",
        DROP COLUMN IF EXISTS "exclusions",
        DROP COLUMN IF EXISTS "faqs",
        DROP COLUMN IF EXISTS "rating_average",
        DROP COLUMN IF EXISTS "rating_count",
        DROP COLUMN IF EXISTS "rating_distribution",
        DROP COLUMN IF EXISTS "sort_order";
    `);
  }
}

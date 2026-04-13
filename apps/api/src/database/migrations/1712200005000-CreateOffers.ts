import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOffers1712200005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "offers" (
        "id"            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        "title"         varchar(100)  NOT NULL,
        "description"   text          NOT NULL DEFAULT '',
        "tag"           varchar(30)   NOT NULL,
        "cta_text"      varchar(30)   NOT NULL DEFAULT 'Book Now',
        "category"      varchar(50)   NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
        "image_url"     varchar(500)  NOT NULL DEFAULT '',
        "bg_gradient"   varchar(300)  NOT NULL,
        "is_active"     boolean       NOT NULL DEFAULT true,
        "sort_order"    integer       NOT NULL DEFAULT 0,
        "created_at"    timestamptz   NOT NULL DEFAULT now(),
        "updated_at"    timestamptz   NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      INSERT INTO "offers" ("title", "description", "tag", "cta_text", "category", "image_url", "bg_gradient", "sort_order")
      VALUES
        ('20% Off AC Services', 'Deep cleaning, gas refill & installation', 'Limited Time', 'Book Now', 'ac', '', 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)', 0),
        ('Flat ₹200 Off TV Repair', 'First booking only. Use code: TVNEW200', 'New User', 'Claim Offer', 'tv', '', 'linear-gradient(135deg, #111827 0%, #4C1D95 100%)', 1),
        ('Purifier + Fridge Combo', 'Save ₹500 when you book both together', 'Combo Deal', 'Book Combo', 'water_purifier', '', 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 62%, #A16207 130%)', 2)
      ON CONFLICT DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "offers";`);
  }
}

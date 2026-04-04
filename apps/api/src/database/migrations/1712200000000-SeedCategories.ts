import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCategories1712200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "categories" ("id", "name", "icon", "description", "color")
      VALUES
        (
          'ac',
          'AC Repair & Service',
          'Snowflake',
          'Professional air conditioner installation, repair, gas refill, and deep cleaning services for all brands.',
          '#3B82F6'
        ),
        (
          'tv',
          'TV Repair & Installation',
          'Tv',
          'Expert LED, LCD, and Smart TV repair, wall mounting, and setup services at your doorstep.',
          '#8B5CF6'
        ),
        (
          'refrigerator',
          'Refrigerator Repair',
          'Thermometer',
          'Reliable refrigerator and freezer repair, thermostat replacement, and gas charging services.',
          '#06B6D4'
        ),
        (
          'microwave',
          'Microwave Repair',
          'UtensilsCrossed',
          'Quick microwave oven repair, magnetron replacement, and servicing for all major brands.',
          '#F59E0B'
        ),
        (
          'water_purifier',
          'Water Purifier Service',
          'Droplets',
          'RO, UV, and UF water purifier installation, filter replacement, and annual maintenance services.',
          '#10B981'
        ),
        (
          'washing_machine',
          'Washing Machine Repair',
          'WashingMachine',
          'Top-load and front-load washing machine repair, drum cleaning, and motor replacement services.',
          '#EC4899'
        )
      ON CONFLICT ("id") DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "categories"
      WHERE "id" IN ('ac', 'tv', 'refrigerator', 'microwave', 'water_purifier', 'washing_machine');
    `);
  }
}

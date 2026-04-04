import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedServices1712200001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "services" ("category", "service_name", "description", "price", "is_basic", "is_active")
      VALUES
        -- AC Repair & Service
        (
          'ac',
          'AC Gas Refill',
          'Complete gas top-up for split and window ACs. Includes leak testing and pressure check.',
          499.00,
          true,
          true
        ),
        (
          'ac',
          'AC Deep Clean',
          'Thorough deep cleaning of indoor and outdoor units with foam-jet technology.',
          399.00,
          true,
          true
        ),
        (
          'ac',
          'AC Installation',
          'Professional split AC installation including drilling, piping, and electrical wiring.',
          1499.00,
          false,
          true
        ),
        (
          'ac',
          'Compressor Repair',
          'Diagnosis and repair of AC compressor issues. Includes replacement if needed (parts extra).',
          2499.00,
          false,
          true
        ),

        -- TV Repair & Installation
        (
          'tv',
          'TV Wall Mounting',
          'Secure wall mount installation for LED/LCD TVs up to 65 inches. Includes concealed wiring.',
          499.00,
          true,
          true
        ),
        (
          'tv',
          'TV Screen Repair',
          'LCD/LED screen panel diagnosis and replacement for all major TV brands.',
          1999.00,
          false,
          true
        ),
        (
          'tv',
          'Motherboard Repair',
          'TV motherboard diagnosis, chip-level repair, or full board replacement.',
          1299.00,
          false,
          true
        ),
        (
          'tv',
          'TV General Checkup',
          'Complete diagnostic checkup covering display, sound, ports, and remote pairing.',
          299.00,
          true,
          true
        ),

        -- Refrigerator Repair
        (
          'refrigerator',
          'Gas Charging',
          'Refrigerant gas recharge for single-door and double-door refrigerators with leak check.',
          599.00,
          true,
          true
        ),
        (
          'refrigerator',
          'Thermostat Replacement',
          'Faulty thermostat diagnosis and replacement to restore proper cooling.',
          899.00,
          false,
          true
        ),
        (
          'refrigerator',
          'Door Seal Replacement',
          'Replacement of worn-out rubber door gasket to improve cooling efficiency.',
          349.00,
          true,
          true
        ),
        (
          'refrigerator',
          'Compressor Replacement',
          'Full compressor replacement for refrigerators with cooling failure. Includes gas charging.',
          2299.00,
          false,
          true
        ),

        -- Microwave Repair
        (
          'microwave',
          'Magnetron Replacement',
          'Replacement of faulty magnetron to restore microwave heating. Compatible with all brands.',
          1199.00,
          false,
          true
        ),
        (
          'microwave',
          'Turntable Motor Repair',
          'Repair or replacement of turntable motor and plate assembly.',
          399.00,
          true,
          true
        ),
        (
          'microwave',
          'General Servicing',
          'Complete checkup including cavity cleaning, door alignment, and functional testing.',
          299.00,
          true,
          true
        ),
        (
          'microwave',
          'Control Panel Repair',
          'Diagnosis and repair of touch panel, timer, and control board issues.',
          899.00,
          false,
          true
        ),

        -- Water Purifier Service
        (
          'water_purifier',
          'Filter Replacement',
          'Replacement of sediment, carbon, and RO membrane filters for optimal water quality.',
          499.00,
          true,
          true
        ),
        (
          'water_purifier',
          'Annual Maintenance',
          'Complete servicing including filter change, UV lamp check, tank sanitization, and TDS calibration.',
          899.00,
          false,
          true
        ),
        (
          'water_purifier',
          'RO Installation',
          'New RO water purifier installation with plumbing, wall mounting, and initial flush.',
          599.00,
          true,
          true
        ),
        (
          'water_purifier',
          'UV Lamp Replacement',
          'Replacement of UV lamp and ballast for UV and UV+RO water purifier models.',
          799.00,
          false,
          true
        ),

        -- Washing Machine Repair
        (
          'washing_machine',
          'Drum Cleaning',
          'Deep cleaning of washing machine drum to remove lint, mold, and odor buildup.',
          399.00,
          true,
          true
        ),
        (
          'washing_machine',
          'Motor Replacement',
          'Complete motor replacement for top-load and front-load washing machines.',
          2199.00,
          false,
          true
        ),
        (
          'washing_machine',
          'Drain Pump Repair',
          'Diagnosis and repair of drain pump blockage or motor failure.',
          549.00,
          true,
          true
        ),
        (
          'washing_machine',
          'PCB Board Repair',
          'Electronic control board diagnosis and repair for washing machine programs and cycles.',
          1499.00,
          false,
          true
        )
      ON CONFLICT DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "services"
      WHERE "category" IN ('ac', 'tv', 'refrigerator', 'microwave', 'water_purifier', 'washing_machine');
    `);
  }
}

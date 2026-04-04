import { CategoryEntity } from '@/database/entities';

type CategorySeed = Pick<
  CategoryEntity,
  'id' | 'name' | 'icon' | 'description' | 'color'
>;

export const CATEGORY_SEEDS: CategorySeed[] = [
  {
    id: 'ac',
    name: 'AC Repair & Service',
    icon: 'Snowflake',
    description:
      'Professional air conditioner installation, repair, gas refill, and deep cleaning services for all brands.',
    color: '#3B82F6',
  },
  {
    id: 'tv',
    name: 'TV Repair & Installation',
    icon: 'Tv',
    description:
      'Expert LED, LCD, and Smart TV repair, wall mounting, and setup services at your doorstep.',
    color: '#8B5CF6',
  },
  {
    id: 'refrigerator',
    name: 'Refrigerator Repair',
    icon: 'Thermometer',
    description:
      'Reliable refrigerator and freezer repair, thermostat replacement, and gas charging services.',
    color: '#06B6D4',
  },
  {
    id: 'microwave',
    name: 'Microwave Repair',
    icon: 'UtensilsCrossed',
    description:
      'Quick microwave oven repair, magnetron replacement, and servicing for all major brands.',
    color: '#F59E0B',
  },
  {
    id: 'water_purifier',
    name: 'Water Purifier Service',
    icon: 'Droplets',
    description:
      'RO, UV, and UF water purifier installation, filter replacement, and annual maintenance services.',
    color: '#10B981',
  },
  {
    id: 'washing_machine',
    name: 'Washing Machine Repair',
    icon: 'WashingMachine',
    description:
      'Top-load and front-load washing machine repair, drum cleaning, and motor replacement services.',
    color: '#EC4899',
  },
];

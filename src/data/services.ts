import type { Service } from '../types/domain'

export const initialServices: Service[] = [
  { id: 1, category: 'ac', service_name: 'Basic Service (Cleaning & Inspection)', description: 'Filter cleaning, gas pressure check, and comprehensive inspection', price: 499, is_basic: true, is_active: true },
  { id: 2, category: 'ac', service_name: 'Installation', description: 'Professional split or window AC installation with bracket fitting', price: 1299, is_basic: false, is_active: true },
  { id: 3, category: 'ac', service_name: 'Dismantle', description: 'Safe removal of AC unit including gas recovery and packing', price: 799, is_basic: false, is_active: true },
  { id: 4, category: 'ac', service_name: 'General Service', description: 'Full AC service with coil cleaning, drain flush, and tuning', price: 699, is_basic: false, is_active: true },
  { id: 5, category: 'ac', service_name: 'Repair', description: 'Diagnosis and repair of cooling, electrical, or mechanical faults', price: 399, is_basic: false, is_active: true },
  { id: 6, category: 'ac', service_name: 'Gas Recharge', description: 'Refrigerant gas top-up with leak detection and testing', price: 1499, is_basic: false, is_active: true },
  { id: 7, category: 'ac', service_name: 'Jet Wash', description: 'High-pressure jet cleaning of evaporator and condenser coils', price: 899, is_basic: false, is_active: true },
  { id: 8, category: 'tv', service_name: 'Basic Service', description: 'General inspection, connection check, and firmware update', price: 349, is_basic: true, is_active: true },
  { id: 9, category: 'tv', service_name: 'Installation', description: 'Wall mounting with concealed wiring and set-top box setup', price: 599, is_basic: false, is_active: true },
  { id: 10, category: 'tv', service_name: 'Repair', description: 'Diagnosis and repair of display, sound, power, or board issues', price: 499, is_basic: false, is_active: true },
  { id: 11, category: 'refrigerator', service_name: 'Basic Service', description: 'Thermostat check, coil cleaning, and gas pressure test', price: 449, is_basic: true, is_active: true },
  { id: 12, category: 'refrigerator', service_name: 'Repair', description: 'General repair including door, seal, and electrical fixes', price: 599, is_basic: false, is_active: true },
  { id: 13, category: 'refrigerator', service_name: 'Gas Refill', description: 'Complete gas charging with leak detection and pressure testing', price: 1399, is_basic: false, is_active: true },
  { id: 14, category: 'refrigerator', service_name: 'Cooling Issue Fix', description: 'Diagnosis and fix for insufficient cooling or frost buildup', price: 799, is_basic: false, is_active: true },
  { id: 15, category: 'refrigerator', service_name: 'Compressor Issue', description: 'Compressor diagnosis, repair, or replacement with warranty', price: 2999, is_basic: false, is_active: true },
  { id: 16, category: 'microwave', service_name: 'Basic Service', description: 'General inspection, turntable check, cleaning, and test', price: 349, is_basic: true, is_active: true },
  { id: 17, category: 'microwave', service_name: 'Repair', description: 'Magnetron, fuse, transformer, and component repair', price: 599, is_basic: false, is_active: true },
  { id: 18, category: 'microwave', service_name: 'Not Heating Issue', description: 'Diagnosis and fix for microwave not heating food', price: 499, is_basic: false, is_active: true },
  { id: 19, category: 'microwave', service_name: 'Button / Panel Issue', description: 'Keypad, touch panel, and control board repair', price: 449, is_basic: false, is_active: true },
  { id: 20, category: 'water_purifier', service_name: 'Basic Service', description: 'Complete RO/UV/UF service with filter inspection', price: 449, is_basic: true, is_active: true },
  { id: 21, category: 'water_purifier', service_name: 'Installation', description: 'New water purifier installation with plumbing', price: 599, is_basic: false, is_active: true },
  { id: 22, category: 'water_purifier', service_name: 'Filter Change', description: 'Replacement of sediment, carbon, and RO membrane filters', price: 799, is_basic: false, is_active: true },
  { id: 23, category: 'water_purifier', service_name: 'General Service', description: 'TDS check, flow rate test, and UV lamp inspection', price: 549, is_basic: false, is_active: true },
  { id: 24, category: 'water_purifier', service_name: 'Repair', description: 'Leak fix, motor repair, and electrical troubleshooting', price: 499, is_basic: false, is_active: true },
  { id: 25, category: 'washing_machine', service_name: 'Basic Service', description: 'Full drum cleaning, filter check, inlet/outlet inspection', price: 549, is_basic: true, is_active: true },
  { id: 26, category: 'washing_machine', service_name: 'Installation', description: 'Professional front/top load washing machine installation with plumbing', price: 799, is_basic: false, is_active: true },
  { id: 27, category: 'washing_machine', service_name: 'Repair', description: 'Drum, motor, PCB board, and drainage system repair', price: 699, is_basic: false, is_active: true },
  { id: 28, category: 'washing_machine', service_name: 'Not Draining Fix', description: 'Drain pump repair, hose unclogging, and water level sensor fix', price: 599, is_basic: false, is_active: true },
  { id: 29, category: 'washing_machine', service_name: 'Drum Deep Clean', description: 'Anti-bacterial deep cleaning with descaling and deodorizing', price: 449, is_basic: false, is_active: true },
  { id: 30, category: 'washing_machine', service_name: 'Vibration / Noise Fix', description: 'Leveling, bearing replacement, and suspension repair', price: 899, is_basic: false, is_active: true },
]

export const CONVENIENCE_FEE = 49
export const GST_RATE = 0.18

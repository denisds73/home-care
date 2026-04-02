import type { CategoryId, CategoryMeta } from '../types/domain'
import acImg from '../assets/images/ac-service.jpg'
import tvImg from '../assets/images/tv-service.jpg'
import fridgeImg from '../assets/images/fridge-service.jpg'
import microwaveImg from '../assets/images/microwave-service.jpg'
import purifierImg from '../assets/images/purifier-service.jpg'

export const CATEGORY_IMAGES: Record<CategoryId, string> = {
  ac: acImg,
  tv: tvImg,
  refrigerator: fridgeImg,
  microwave: microwaveImg,
  water_purifier: purifierImg,
  washing_machine: acImg,
}

export const SERVICE_IMAGES: Record<CategoryId, string> = { ...CATEGORY_IMAGES }

export const STORYSET_IMGS: Record<CategoryId, string> = {
  ac: 'https://stories.freepiklabs.com/storage/16928/Electrician_Mesa-de-trabajo-1.svg',
  tv: 'https://stories.freepiklabs.com/storage/35163/Home-Cinema-(1)_Mesa-de-trabajo-1.svg',
  refrigerator: 'https://stories.freepiklabs.com/storage/49796/Kitchen-Appliances-amico_Mesa-de-trabajo-1.svg',
  microwave: 'https://stories.freepiklabs.com/storage/2407/Product-Teardown_Mesa-de-trabajo-1.svg',
  water_purifier: 'https://stories.freepiklabs.com/storage/42433/Pipeline-Maintenance_Mesa-de-trabajo-1.svg',
  washing_machine: 'https://stories.freepiklabs.com/storage/1120/Maintenance_Mesa-de-trabajo-1.svg',
}

export const CATEGORY_SVGS: Record<CategoryId, string> = {
  ac: `<svg viewBox="0 0 64 64" fill="none"><rect x="6" y="12" width="52" height="28" rx="6" fill="#EDE9FE" stroke="#6D28D9" stroke-width="2"/><rect x="12" y="18" width="40" height="4" rx="2" fill="#C4B5FD"/><rect x="12" y="24" width="40" height="4" rx="2" fill="#C4B5FD"/><rect x="12" y="30" width="40" height="4" rx="2" fill="#C4B5FD"/><path d="M20 44v8M32 44v8M44 44v8" stroke="#6D28D9" stroke-width="2" stroke-linecap="round"/><circle cx="48" cy="20" r="3" fill="#6D28D9"/></svg>`,
  tv: `<svg viewBox="0 0 64 64" fill="none"><rect x="6" y="14" width="52" height="32" rx="4" fill="#EDE9FE" stroke="#6D28D9" stroke-width="2"/><rect x="10" y="18" width="44" height="24" rx="2" fill="#DDD6FE"/><rect x="22" y="50" width="20" height="4" rx="2" fill="#6D28D9"/><circle cx="32" cy="30" r="8" fill="#6D28D9" opacity=".25"/><path d="M29 25l9 5-9 5V25z" fill="#6D28D9"/></svg>`,
  refrigerator: `<svg viewBox="0 0 64 64" fill="none"><rect x="14" y="4" width="36" height="56" rx="6" fill="#EDE9FE" stroke="#6D28D9" stroke-width="2"/><line x1="14" y1="28" x2="50" y2="28" stroke="#6D28D9" stroke-width="2"/><rect x="40" y="16" width="3" height="8" rx="1.5" fill="#6D28D9"/><rect x="40" y="34" width="3" height="8" rx="1.5" fill="#6D28D9"/></svg>`,
  microwave: `<svg viewBox="0 0 64 64" fill="none"><rect x="6" y="14" width="52" height="36" rx="6" fill="#EDE9FE" stroke="#6D28D9" stroke-width="2"/><rect x="10" y="18" width="32" height="28" rx="4" fill="#DDD6FE"/><circle cx="50" cy="24" r="3" fill="#6D28D9"/><circle cx="50" cy="32" r="3" fill="#6D28D9"/></svg>`,
  water_purifier: `<svg viewBox="0 0 64 64" fill="none"><rect x="14" y="6" width="36" height="48" rx="6" fill="#EDE9FE" stroke="#6D28D9" stroke-width="2"/><circle cx="32" cy="24" r="10" fill="#C4B5FD" stroke="#6D28D9" stroke-width="1.5"/><path d="M32 18v4l3 2" stroke="#6D28D9" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  washing_machine: `<svg viewBox="0 0 64 64" fill="none"><rect x="10" y="4" width="44" height="56" rx="6" fill="#EDE9FE" stroke="#6D28D9" stroke-width="2"/><circle cx="32" cy="36" r="14" fill="#DDD6FE" stroke="#6D28D9" stroke-width="1.5"/><circle cx="32" cy="36" r="8" fill="#7C3AED" opacity=".35"/><rect x="16" y="10" width="8" height="5" rx="2" fill="#A78BFA"/><rect x="28" y="10" width="8" height="5" rx="2" fill="#A78BFA"/><circle cx="44" cy="12" r="3" fill="#6D28D9"/></svg>`,
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'ac', name: 'AC', icon: '❄️', desc: 'Air Conditioner Services', color: '#7C3AED' },
  { id: 'tv', name: 'TV', icon: '📺', desc: 'Television Services', color: '#6D28D9' },
  { id: 'refrigerator', name: 'Refrigerator', icon: '🧊', desc: 'Refrigerator Services', color: '#4C1D95' },
  { id: 'microwave', name: 'Microwave', icon: '🍳', desc: 'Microwave Oven Services', color: '#D4A017' },
  { id: 'water_purifier', name: 'Water Purifier', icon: '💧', desc: 'Water Purifier Services', color: '#16A34A' },
  { id: 'washing_machine', name: 'Washing Machine', icon: '🫧', desc: 'Washing Machine Services', color: '#6B7280' },
]

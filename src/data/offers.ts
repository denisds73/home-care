import type { Offer } from '../types/domain'
import acImg from '../assets/images/ac-service.jpg'
import tvImg from '../assets/images/tv-service.jpg'
import purifierImg from '../assets/images/purifier-service.jpg'

export const initialOffers: Offer[] = [
  {
    id: 'offer-1',
    title: '20% Off AC Services',
    description: 'Deep cleaning, gas refill & installation',
    tag: 'Limited Time',
    cta_text: 'Book Now',
    category: 'ac',
    image_url: acImg,
    bg_gradient: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)',
    is_active: true,
    sort_order: 0,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'offer-2',
    title: 'Flat ₹200 Off TV Repair',
    description: 'First booking only. Use code: TVNEW200',
    tag: 'New User',
    cta_text: 'Claim Offer',
    category: 'tv',
    image_url: tvImg,
    bg_gradient: 'linear-gradient(135deg, #111827 0%, #4C1D95 100%)',
    is_active: true,
    sort_order: 1,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'offer-3',
    title: 'Purifier + Fridge Combo',
    description: 'Save ₹500 when you book both together',
    tag: 'Combo Deal',
    cta_text: 'Book Combo',
    category: 'water_purifier',
    image_url: purifierImg,
    bg_gradient: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 62%, #A16207 130%)',
    is_active: true,
    sort_order: 2,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
  },
]

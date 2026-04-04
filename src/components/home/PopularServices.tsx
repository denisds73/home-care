import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Reveal from '../common/Reveal'
import type { CategoryId } from '../../types/domain'
import popAc from '../../assets/images/popular-ac.jpg'
import popTv from '../../assets/images/popular-tv.jpg'
import popFridge from '../../assets/images/popular-fridge.jpg'
import popPurifier from '../../assets/images/popular-purifier.jpg'
import microwaveImg from '../../assets/images/microwave-service.jpg'
import acImg from '../../assets/images/ac-service.jpg'

const items: { name: string; desc: string; cat: CategoryId; img: string; rating: string; reviews: string; price: number; badge?: string }[] = [
  { name: 'AC Deep Jet Wash', desc: 'Complete cleaning with high-pressure wash', cat: 'ac', img: popAc, rating: '4.9', reviews: '2.1K', price: 899, badge: '#1 Most Booked' },
  { name: 'TV Wall Mounting', desc: 'Professional mounting with concealed wiring', cat: 'tv', img: popTv, rating: '4.7', reviews: '980', price: 599 },
  { name: 'Fridge Gas Refill', desc: 'Leak detection & complete gas charging', cat: 'refrigerator', img: popFridge, rating: '4.8', reviews: '1.5K', price: 1399 },
  { name: 'RO Filter Change', desc: 'Complete filter replacement & service', cat: 'water_purifier', img: popPurifier, rating: '4.6', reviews: '870', price: 799 },
  { name: 'Microwave Repair', desc: 'Not heating? We diagnose & fix fast', cat: 'microwave', img: microwaveImg, rating: '4.5', reviews: '640', price: 499 },
  { name: 'AC Installation', desc: 'Professional split AC install & setup', cat: 'ac', img: acImg, rating: '4.9', reviews: '1.8K', price: 1299 },
]

function usePerView() {
  const [pv, setPv] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 2 : 1)
  useEffect(() => {
    const h = () => setPv(window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 2 : 1)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return pv
}

export default function PopularServices() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const perView = usePerView()
  const maxIdx = Math.max(0, items.length - perView)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCurrent(c => c >= maxIdx ? 0 : c + 1), 4000)
  }, [maxIdx])
  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [resetTimer])

  const go = (dir: number) => { setCurrent(c => Math.max(0, Math.min(maxIdx, c + dir))); resetTimer() }

  return (
    <div className="py-12 sm:py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal><h2 className="text-xl sm:text-2xl font-bold font-brand text-center mb-2" style={{ color: 'var(--color-secondary)' }}>Popular Services</h2></Reveal>
        <Reveal><p className="text-muted text-sm text-center mb-10">Most booked services by our customers</p></Reveal>
        <Reveal>
          <div className="relative">
            {/* Carousel track */}
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${current * (100 / perView)}%)` }}>
                {items.map((item, i) => (
                  <div key={i} style={{ flex: `0 0 ${100 / perView}%`, padding: '0 8px' }}>
                    <div className="popular-card glass-card rounded-2xl overflow-hidden cursor-pointer h-full" onClick={() => navigate(`/services/${item.cat}`)}>
                      <div className="relative h-44 overflow-hidden">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                        {item.badge && <div className="absolute top-3 left-3"><span className="px-2.5 py-1 rounded-full text-xs font-bold shadow text-white" style={{ background: 'rgba(0,0,0,.7)' }}>{item.badge}</span></div>}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold font-brand text-sm mb-1" style={{ color: 'var(--color-secondary)' }}>{item.name}</h4>
                        <p className="text-muted text-xs mb-2">{item.desc}</p>
                        <div className="flex items-center justify-between">
                          <div className="rating-inline"><span className="rating-star">★</span><span className="rating-num">{item.rating}</span><span>({item.reviews})</span></div>
                          <span className="font-extrabold text-sm text-brand-dark">₹{item.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Prev / Next buttons */}
            <button
              onClick={() => go(-1)}
              aria-label="Previous"
              className="absolute top-1/2 -translate-y-1/2 left-0 sm:-left-5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-default flex items-center justify-center shadow-md"
              style={{ color: 'var(--color-primary)' }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next"
              className="absolute top-1/2 -translate-y-1/2 right-0 sm:-right-5 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-default flex items-center justify-center shadow-md"
              style={{ color: 'var(--color-primary)' }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-5">
              {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); resetTimer() }}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? 24 : 8,
                    background: i === current ? 'var(--color-primary)' : 'rgba(107,114,128,.3)',
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

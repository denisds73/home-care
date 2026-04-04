import { useState, useEffect, useRef, useCallback } from 'react'
import Reveal from '../common/Reveal'
import avatar1 from '../../assets/images/avatar1.jpg'
import avatar2 from '../../assets/images/avatar2.jpg'
import avatar3 from '../../assets/images/avatar3.jpg'

const reviews = [
  { stars: 5, text: '"Amazing service! The technician arrived on time, was very professional, and fixed my AC in under an hour. The jet wash made it feel brand new. Highly recommend!"', name: 'Anita M.', loc: 'Bangalore · AC Service', img: avatar1 },
  { stars: 5, text: '"Booked a water purifier filter change and the whole process was seamless. From booking to payment, everything was smooth. The app is very easy to use!"', name: 'Rahul S.', loc: 'Hyderabad · Purifier Service', img: avatar2 },
  { stars: 4, text: '"Got my TV wall-mounted beautifully. The technician even helped with cable management. Great value for money and very courteous staff. Will use again!"', name: 'Deepa K.', loc: 'Chennai · TV Installation', img: avatar3 },
  { stars: 5, text: '"The fridge wasn\'t cooling at all. The technician diagnosed the issue within minutes and had it running perfectly. Transparent pricing, no hidden charges. Five stars!"', name: 'Suresh P.', loc: 'Pune · Refrigerator Repair', img: avatar1 },
  { stars: 5, text: '"Used HomeCare for microwave repair and water purifier service on the same day. Both technicians were punctual and skilled. The cart feature made booking so convenient!"', name: 'Kavitha R.', loc: 'Delhi · Multiple Services', img: avatar2 },
]

function usePerView() {
  const [pv, setPv] = useState(typeof window !== 'undefined' && window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1)
  useEffect(() => {
    const h = () => setPv(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return pv
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0)
  const perView = usePerView()
  const maxIdx = Math.max(0, reviews.length - perView)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCurrent(c => c >= maxIdx ? 0 : c + 1), 4000)
  }, [maxIdx])
  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [resetTimer])

  const go = (dir: number) => { setCurrent(c => Math.max(0, Math.min(maxIdx, c + dir))); resetTimer() }

  return (
    <div className="py-12 sm:py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal><h2 className="text-xl sm:text-2xl font-bold font-brand text-center mb-2" style={{ color: 'var(--color-secondary)' }}>What Our Customers Say</h2></Reveal>
        <Reveal><p className="text-muted text-sm text-center mb-10">Real reviews from real customers</p></Reveal>
        <Reveal>
          <div className="relative">
            {/* Carousel track */}
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${current * (100 / perView)}%)` }}>
                {reviews.map((r, i) => (
                  <div key={i} style={{ flex: `0 0 ${100 / perView}%`, padding: '0 8px' }}>
                    <div className="testimonial-card glass-testimonial rounded-2xl shadow-sm p-6 h-full">
                      <div className="flex items-center justify-between mb-3">
                        <span className="stars text-sm">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--color-success)' }}>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                          Verified
                        </span>
                      </div>
                      <p className="text-secondary text-sm leading-relaxed mb-4">{r.text}</p>
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                        <img src={r.img} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'var(--color-secondary)' }}>{r.name}</p>
                          <p className="text-muted text-xs">{r.loc}</p>
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

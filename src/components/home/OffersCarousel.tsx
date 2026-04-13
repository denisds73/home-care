import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Reveal from '../common/Reveal'
import useStore from '../../store/useStore'

export default function OffersCarousel() {
  const allOffers = useStore(s => s.offers)
  const fetchOffers = useStore(s => s.fetchOffers)
  const activeOffers = useMemo(
    () => allOffers
      .filter(o => o.is_active)
      .sort((a, b) => a.sort_order - b.sort_order),
    [allOffers],
  )

  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const count = activeOffers.length

  useEffect(() => {
    fetchOffers()
  }, [fetchOffers])

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (count > 1) {
      timerRef.current = setInterval(() => setCurrent(c => (c + 1) % count), 5000)
    }
  }

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  const safeCurrent = current >= count ? 0 : current

  if (count === 0) return null

  const go = (dir: number) => {
    setCurrent(c => {
      const n = c + dir
      return n < 0 ? count - 1 : n >= count ? 0 : n
    })
    resetTimer()
  }

  return (
    <section id="offersSection" className="py-12 sm:py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal>
          <div className="category-row-header">
            <h3 className="text-lg font-bold font-brand text-primary flex items-center gap-2">
              <span className="w-[3px] h-5 rounded-sm bg-brand shrink-0" />
              Offers &amp; Discounts
            </h3>
          </div>
        </Reveal>

        <Reveal>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${safeCurrent * 100}%)` }}
              >
                {activeOffers.map((offer, i) => (
                  <div
                    key={offer.id}
                    className="w-full shrink-0 rounded-2xl overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    style={{ background: offer.bg_gradient }}
                    onClick={() => navigate(`/app/services/${offer.category}`)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/app/services/${offer.category}`) }}
                    role="link"
                    tabIndex={safeCurrent === i ? 0 : -1}
                  >
                    <div className="flex items-center justify-between px-6 sm:px-10 py-8 sm:py-10">
                      <div className="max-w-md">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4 bg-white/20 text-white">
                          {offer.tag}
                        </span>
                        <h4 className="text-xl sm:text-2xl font-extrabold font-brand text-white mb-2">{offer.title}</h4>
                        <p className="text-sm sm:text-base text-white/80 mb-5">{offer.description}</p>
                        <span
                          className="inline-block bg-white px-6 py-2.5 rounded-full text-sm font-bold"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {offer.cta_text}
                        </span>
                      </div>
                      {offer.image_url && (
                        <img
                          src={offer.image_url}
                          alt={offer.title}
                          className="hidden sm:block w-36 h-36 md:w-44 md:h-44 object-cover rounded-2xl shadow-lg shrink-0 ml-6"
                          onError={e => { e.currentTarget.style.display = 'none' }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {count > 1 && (
              <>
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous offer"
                  className="absolute top-1/2 -translate-y-1/2 left-2 sm:-left-5 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-default flex items-center justify-center shadow-md"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label="Next offer"
                  className="absolute top-1/2 -translate-y-1/2 right-2 sm:-right-5 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-default flex items-center justify-center shadow-md"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {count > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {activeOffers.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrent(i); resetTimer() }}
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: i === safeCurrent ? 24 : 8,
                      background: i === safeCurrent ? 'var(--color-primary)' : 'rgba(107,114,128,.3)',
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

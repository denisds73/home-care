import { useState, useEffect, useRef } from 'react'
import useStore from '../../store/useStore'
import Reveal from '../common/Reveal'
import acImg from '../../assets/images/ac-service.jpg'
import tvImg from '../../assets/images/tv-service.jpg'
import purifierImg from '../../assets/images/purifier-service.jpg'

const offers = [
  { bg: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)', tag: 'Limited Time', tagColor: '#6D28D9', title: '20% Off AC Services', desc: 'Deep cleaning, gas refill & installation', cta: 'Book Now', cat: 'ac', img: acImg },
  { bg: 'linear-gradient(135deg, #111827 0%, #4C1D95 100%)', tag: 'New User', tagColor: '#111827', title: 'Flat ₹200 Off TV Repair', desc: 'First booking only. Use code: TVNEW200', cta: 'Claim Offer', cat: 'tv', img: tvImg },
  { bg: 'linear-gradient(135deg, #4C1D95 0%, #6D28D9 62%, #A16207 130%)', tag: 'Combo Deal', tagColor: '#A16207', title: 'Purifier + Fridge Combo', desc: 'Save ₹500 when you book both together', cta: 'Book Combo', cat: 'water_purifier', img: purifierImg },
]

export default function OffersCarousel() {
  const [current, setCurrent] = useState(0)
  const setView = useStore(s => s.setView)
  const timerRef = useRef(null)

  const resetTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCurrent(c => (c + 1) % offers.length), 5000)
  }

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current) }, [])

  const go = (dir) => { setCurrent(c => { const n = c + dir; return n < 0 ? offers.length - 1 : n >= offers.length ? 0 : n }); resetTimer() }

  return (
    <div id="offersSection" className="py-12 sm:py-16 bg-surface">
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
          <div className="carousel-container">
            <div className="carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
              {offers.map((offer, i) => (
                <div key={i} className="carousel-slide" style={{ flex: '0 0 100%', padding: '0 6px' }}>
                  <div
                    className="offer-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    style={{ background: offer.bg, color: '#fff', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    onClick={() => setView('services', offer.cat)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setView('services', offer.cat)}
                    role="button"
                    tabIndex={0}
                  >
                    <div>
                      <span className="offer-tag" style={{ color: offer.tagColor }}>{offer.tag}</span>
                      <h4 className="text-lg sm:text-2xl font-extrabold font-brand mt-8 mb-2">{offer.title}</h4>
                      <p className="text-sm opacity-90 mb-3">{offer.desc}</p>
                      <span className="inline-block bg-white px-5 py-2 rounded-full text-sm font-bold" style={{ color: offer.tagColor }}>{offer.cta}</span>
                    </div>
                    <img src={offer.img} alt="" className="hidden sm:block w-32 h-32 object-cover rounded-2xl shadow-lg" />
                  </div>
                </div>
              ))}
            </div>
            <button className="carousel-btn carousel-btn-prev glass" onClick={() => go(-1)} aria-label="Previous">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button className="carousel-btn carousel-btn-next glass" onClick={() => go(1)} aria-label="Next">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
            <div className="carousel-dots">
              {offers.map((_, i) => (
                <button key={i} onClick={() => { setCurrent(i); resetTimer() }} className={`carousel-dot ${i === current ? 'active' : ''}`} aria-label={`Go to slide ${i + 1}`} />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

import Reveal from '../common/Reveal'
import heroBg from '../../assets/images/hero-bg.jpg'

export default function Hero() {
  return (
    <div className="hero-section text-white py-16 sm:py-20 md:py-28" style={{ background: `url(${heroBg}) center/cover no-repeat`, minHeight: '420px', position: 'relative' }}>
      <div className="hero-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(11,18,32,.84) 0%, rgba(23,37,84,.58) 48%, rgba(109,40,217,.62) 100%)' }} />
      <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Reveal>
            <div className="inline-block glass-hero-stat px-4 py-1.5 mb-5" style={{ borderRadius: '30px', fontSize: '.75rem', fontWeight: 600, letterSpacing: '.5px' }}>
              ★ Rated 4.8 by 10,000+ customers
            </div>
          </Reveal>
          <Reveal delay={1}>
            <h1 className="hero-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-brand mb-5 leading-tight">
              Home Appliance Services<br/>Done Right, Every Time
            </h1>
          </Reveal>
          <Reveal delay={2}>
            <p className="text-base sm:text-lg md:text-xl opacity-90 mb-8 max-w-xl mx-auto">
              AC, TV, Refrigerator, Microwave &amp; Water Purifier — book a verified technician in under 2 minutes.
            </p>
          </Reveal>
          <Reveal delay={3}>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <a href="#categorySection" className="btn-base btn-primary px-8 sm:px-10 py-3.5 rounded-full text-sm sm:text-base font-bold shadow-lg inline-flex items-center gap-2" style={{ textDecoration: 'none' }}>
                Book a Service
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

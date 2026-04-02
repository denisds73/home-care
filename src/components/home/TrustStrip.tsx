import Reveal from '../common/Reveal'

const items = [
  { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>, num: '4.8', label: 'Service Rating*' },
  { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>, num: '10K+', label: 'Customers Served' },
  { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>, num: '500+', label: 'Verified Professionals' },
  { icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>, num: '30 min', label: 'Avg. Response Time' },
]

export default function TrustStrip() {
  return (
    <Reveal className="trust-strip">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-center gap-8 sm:gap-16 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:gap-4 max-sm:py-2" style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
        {items.map((item, i) => (
          <div key={i} className="trust-item shrink-0 max-sm:scroll-snap-center">
            <svg className="w-8 h-8 shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">{item.icon}</svg>
            <div>
              <p className="trust-number">{item.num}</p>
              <p className="trust-label">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  )
}

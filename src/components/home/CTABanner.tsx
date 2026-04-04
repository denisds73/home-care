import Reveal from '../common/Reveal'

export default function CTABanner() {
  return (
    <div className="py-12 sm:py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal>
          <div className="cta-banner text-white p-8 sm:p-12">
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold font-brand mb-2">Need a service right now?</h3>
                <p className="text-sm opacity-90 max-w-md">Book any appliance service and get a verified technician at your doorstep within 2 hours.</p>
              </div>
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-white px-8 py-3 rounded-full font-bold text-sm whitespace-nowrap shadow-lg transition hover:shadow-xl hover:scale-105" style={{ color: 'var(--color-primary)' }}>
                Book a Service
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

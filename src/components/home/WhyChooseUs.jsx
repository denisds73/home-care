import Reveal from '../common/Reveal'

const features = [
  { img: 'https://stories.freepiklabs.com/storage/1120/Maintenance_Mesa-de-trabajo-1.svg', title: 'Verified Professionals', desc: 'Background-verified, trained, and rated by customers.' },
  { img: 'https://stories.freepiklabs.com/storage/13522/Call-Center_Mesa-de-trabajo-1.svg', title: '30-Day Warranty', desc: "Not satisfied? We'll fix it free within 30 days." },
  { img: 'https://stories.freepiklabs.com/storage/2576/Mobile-Payments_Mesa-de-trabajo-1.svg', title: 'Transparent Pricing', desc: 'No hidden charges. See exact prices before you book.' },
  { img: 'https://stories.freepiklabs.com/storage/4706/Schedule-(1)_Mesa-de-trabajo-1.svg', title: 'On-Time, Every Time', desc: "Technicians arrive within the scheduled slot or it's free." },
]

export default function WhyChooseUs() {
  return (
    <div className="py-12 sm:py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal><h2 className="text-xl sm:text-2xl font-bold font-brand text-center mb-2" style={{ color: 'var(--color-secondary)' }}>Why Choose HomeCare?</h2></Reveal>
        <Reveal><div className="flex justify-center mb-2"><div style={{ width: 40, height: 3, borderRadius: 2, background: 'var(--color-primary)' }} /></div></Reveal>
        <Reveal><p className="text-muted text-sm text-center mb-10">We go the extra mile to make home services hassle-free</p></Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <Reveal key={i} delay={i + 1}>
              <div className="feature-card glass-card rounded-2xl p-4 sm:p-5">
                <img src={f.img} alt={f.title} className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 object-contain" loading="lazy" />
                <h4 className="font-bold font-brand text-xs sm:text-sm mb-1 text-center" style={{ color: 'var(--color-secondary)' }}>{f.title}</h4>
                <p className="text-muted text-xs leading-relaxed text-center">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal><p className="text-center text-xs text-muted mt-6">Illustrations by <a href="https://storyset.com" target="_blank" rel="noopener noreferrer" className="underline">Storyset</a></p></Reveal>
      </div>
    </div>
  )
}

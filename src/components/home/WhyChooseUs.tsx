import Reveal from '../common/Reveal'

/* ── Brand-themed scene illustrations ─────────────────────────── */
const C = {
  primary: 'var(--color-primary)',
  light: 'var(--color-primary-light)',
  dark: 'var(--color-primary-dark)',
  soft: 'var(--color-primary-soft)',
  accent: 'var(--color-accent)',
  accentSoft: 'var(--color-accent-soft)',
  success: 'var(--color-success)',
} as const
const FONT = "'Lexend','Manrope',system-ui"

function VerifiedIllustration() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden="true" className="w-full h-full">
      {/* Background circle */}
      <circle cx="100" cy="85" r="55" fill={C.soft} />
      {/* Floor / shadow */}
      <ellipse cx="100" cy="140" rx="50" ry="6" fill={C.soft} opacity=".6" />
      {/* Person body */}
      <rect x="78" y="68" width="44" height="52" rx="8" fill={C.primary} />
      {/* Person head */}
      <circle cx="100" cy="52" r="18" fill={C.light} />
      {/* Face features */}
      <circle cx="93" cy="49" r="2" fill={C.soft} />
      <circle cx="107" cy="49" r="2" fill={C.soft} />
      <path d="M95 57 q5 4 10 0" stroke={C.soft} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* ID Badge */}
      <rect x="88" y="78" width="24" height="16" rx="3" fill="white" />
      <rect x="92" y="82" width="16" height="2" rx="1" fill={C.light} />
      <rect x="92" y="87" width="10" height="2" rx="1" fill={C.soft} />
      {/* Shield badge */}
      <g transform="translate(130, 38)">
        <path d="M0 6 C0 2, 3 0, 18 0 C33 0, 36 2, 36 6 C36 22, 18 32, 18 32 C18 32, 0 22, 0 6Z" fill={C.accent} />
        <path d="M4 8 C4 5, 6 3, 18 3 C30 3, 32 5, 32 8 C32 20, 18 28, 18 28 C18 28, 4 20, 4 8Z" fill={C.accentSoft} />
        <path d="M12 16 l4 4 8-8" stroke={C.success} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
      {/* Star ratings */}
      {[44, 56, 68].map((x) => (
        <polygon key={x} points={`${x},130 ${x + 3},124 ${x + 6},130 ${x + 1},126 ${x + 5},126`} fill={C.accent} />
      ))}
      {/* Clipboard */}
      <g transform="translate(34, 58)">
        <rect x="0" y="4" width="24" height="30" rx="3" fill="white" stroke={C.light} strokeWidth="1.5" />
        <rect x="6" y="0" width="12" height="8" rx="2" fill={C.light} />
        <line x1="5" y1="18" x2="19" y2="18" stroke={C.soft} strokeWidth="2" strokeLinecap="round" />
        <line x1="5" y1="23" x2="15" y2="23" stroke={C.soft} strokeWidth="2" strokeLinecap="round" />
        <line x1="5" y1="28" x2="17" y2="28" stroke={C.soft} strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  )
}

function SecurePaymentsIllustration() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden="true" className="w-full h-full">
      {/* Background circle */}
      <circle cx="100" cy="85" r="55" fill={C.soft} />
      <ellipse cx="100" cy="140" rx="50" ry="6" fill={C.soft} opacity=".6" />
      {/* Credit card */}
      <g transform="translate(52, 48)">
        <rect x="0" y="0" width="80" height="50" rx="8" fill={C.primary} />
        <rect x="0" y="12" width="80" height="10" fill={C.dark} />
        {/* Card chip */}
        <rect x="10" y="28" width="14" height="10" rx="2" fill={C.accent} />
        <line x1="14" y1="28" x2="14" y2="38" stroke={C.accentSoft} strokeWidth="1" />
        <line x1="20" y1="28" x2="20" y2="38" stroke={C.accentSoft} strokeWidth="1" />
        <line x1="10" y1="33" x2="24" y2="33" stroke={C.accentSoft} strokeWidth="1" />
        {/* Card number dots */}
        {[36, 40, 44, 48, 56, 60, 64, 68].map((cx) => (
          <circle key={cx} cx={cx} cy="33" r="1.5" fill={C.soft} opacity=".7" />
        ))}
      </g>
      {/* Lock / shield overlay */}
      <g transform="translate(110, 75)">
        {/* Shield shape */}
        <path d="M0 8 C0 3, 4 0, 24 0 C44 0, 48 3, 48 8 C48 28, 24 40, 24 40 C24 40, 0 28, 0 8Z" fill={C.success} />
        <path d="M4 10 C4 6, 7 4, 24 4 C41 4, 44 6, 44 10 C44 26, 24 36, 24 36 C24 36, 4 26, 4 10Z" fill="white" />
        {/* Lock body */}
        <rect x="15" y="16" width="18" height="14" rx="3" fill={C.success} />
        {/* Lock shackle */}
        <path d="M18 16 V12 Q18 6, 24 6 Q30 6, 30 12 V16" stroke={C.success} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Keyhole */}
        <circle cx="24" cy="22" r="2.5" fill="white" />
        <rect x="23" y="23" width="2" height="4" rx="1" fill="white" />
      </g>
      {/* Encrypted data lines */}
      <g transform="translate(30, 105)">
        <rect x="0" y="0" width="50" height="6" rx="3" fill={C.light} opacity=".5" />
        <rect x="0" y="10" width="36" height="6" rx="3" fill={C.light} opacity=".35" />
        <rect x="0" y="20" width="44" height="6" rx="3" fill={C.light} opacity=".2" />
      </g>
      {/* Checkmark badge */}
      <g transform="translate(42, 35)">
        <circle cx="10" cy="10" r="10" fill={C.accent} />
        <path d="M6 10 l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Signal / encryption waves */}
      <path d="M160 60 Q166 55, 168 60" stroke={C.light} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".6" />
      <path d="M162 53 Q170 46, 174 53" stroke={C.light} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".4" />
      <path d="M164 46 Q174 37, 180 46" stroke={C.light} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".25" />
    </svg>
  )
}

function PricingIllustration() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden="true" className="w-full h-full">
      {/* Background circle */}
      <circle cx="100" cy="85" r="55" fill={C.soft} />
      <ellipse cx="100" cy="140" rx="50" ry="6" fill={C.soft} opacity=".6" />
      {/* Phone body */}
      <rect x="68" y="35" width="50" height="90" rx="10" fill={C.dark} />
      <rect x="72" y="42" width="42" height="72" rx="4" fill="white" />
      {/* Phone notch */}
      <rect x="86" y="37" width="14" height="3" rx="1.5" fill={C.light} />
      {/* Price display */}
      <rect x="78" y="50" width="30" height="14" rx="3" fill={C.soft} />
      <text x="93" y="60" textAnchor="middle" fill={C.primary} fontSize="9" fontWeight="800" fontFamily={FONT}>$49</text>
      {/* Receipt lines */}
      <line x1="78" y1="72" x2="108" y2="72" stroke={C.soft} strokeWidth="2" strokeLinecap="round" />
      <line x1="78" y1="78" x2="100" y2="78" stroke={C.soft} strokeWidth="2" strokeLinecap="round" />
      <line x1="78" y1="84" x2="105" y2="84" stroke={C.soft} strokeWidth="2" strokeLinecap="round" />
      {/* Total line */}
      <line x1="78" y1="92" x2="108" y2="92" stroke={C.light} strokeWidth="1" />
      <line x1="78" y1="98" x2="96" y2="98" stroke={C.light} strokeWidth="2" strokeLinecap="round" />
      <text x="108" y="99" textAnchor="end" fill={C.primary} fontSize="7" fontWeight="700" fontFamily={FONT}>$49</text>
      {/* Price tag */}
      <g transform="translate(120, 50)">
        <path d="M0 16 L16 0 L40 0 L40 32 L16 32Z" fill={C.accent} />
        <circle cx="22" cy="16" r="4" fill={C.accentSoft} />
        <path d="M8 16 L14 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Coins */}
      <ellipse cx="50" cy="115" rx="14" ry="5" fill={C.accent} />
      <ellipse cx="50" cy="112" rx="14" ry="5" fill={C.accentSoft} stroke={C.accent} strokeWidth="1" />
      <ellipse cx="50" cy="109" rx="14" ry="5" fill={C.accent} />
      <text x="50" y="112" textAnchor="middle" fill="white" fontSize="6" fontWeight="700" fontFamily={FONT}>$</text>
      {/* No hidden fees badge */}
      <g transform="translate(125, 95)">
        <rect x="0" y="0" width="40" height="18" rx="9" fill={C.success} />
        <text x="20" y="13" textAnchor="middle" fill="white" fontSize="7" fontWeight="600" fontFamily={FONT}>0 fees</text>
      </g>
    </svg>
  )
}

function OnTimeIllustration() {
  return (
    <svg viewBox="0 0 200 160" fill="none" aria-hidden="true" className="w-full h-full">
      {/* Background circle */}
      <circle cx="100" cy="85" r="55" fill={C.soft} />
      <ellipse cx="100" cy="140" rx="50" ry="6" fill={C.soft} opacity=".6" />
      {/* Clock face */}
      <circle cx="100" cy="78" r="38" fill="white" stroke={C.primary} strokeWidth="3" />
      <circle cx="100" cy="78" r="34" fill="white" stroke={C.soft} strokeWidth="1" />
      {/* Clock ticks */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const x1 = 100 + 28 * Math.sin(rad)
        const y1 = 78 - 28 * Math.cos(rad)
        const x2 = 100 + 32 * Math.sin(rad)
        const y2 = 78 - 32 * Math.cos(rad)
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.light} strokeWidth={deg % 90 === 0 ? 2.5 : 1.5} strokeLinecap="round" />
      })}
      {/* Hour hand - pointing to ~10 */}
      <line x1="100" y1="78" x2="88" y2="60" stroke={C.dark} strokeWidth="3" strokeLinecap="round" />
      {/* Minute hand - pointing to ~2 */}
      <line x1="100" y1="78" x2="118" y2="58" stroke={C.primary} strokeWidth="2" strokeLinecap="round" />
      {/* Center dot */}
      <circle cx="100" cy="78" r="3" fill={C.primary} />
      {/* Checkmark badge */}
      <g transform="translate(128, 44)">
        <circle cx="16" cy="16" r="16" fill={C.success} />
        <path d="M9 16 l5 5 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* Person / technician */}
      <g transform="translate(38, 95)">
        <circle cx="12" cy="8" r="8" fill={C.light} />
        <rect x="2" y="18" width="20" height="24" rx="5" fill={C.primary} />
        {/* Toolbox */}
        <rect x="24" y="30" width="16" height="12" rx="2" fill={C.accent} />
        <rect x="28" y="27" width="8" height="5" rx="2" fill="none" stroke={C.accent} strokeWidth="2" />
      </g>
      {/* Speed lines */}
      <line x1="148" y1="90" x2="162" y2="90" stroke={C.light} strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
      <line x1="150" y1="96" x2="160" y2="96" stroke={C.light} strokeWidth="1.5" strokeLinecap="round" opacity=".4" />
      <line x1="152" y1="102" x2="158" y2="102" stroke={C.light} strokeWidth="1.5" strokeLinecap="round" opacity=".3" />
    </svg>
  )
}

const features = [
  {
    title: 'Verified Professionals',
    desc: 'Background-verified, trained, and rated by customers.',
    illustration: <VerifiedIllustration />,
  },
  {
    title: 'Secure Payments',
    desc: 'Bank-grade encryption protects every transaction you make.',
    illustration: <SecurePaymentsIllustration />,
  },
  {
    title: 'Transparent Pricing',
    desc: 'No hidden charges. See exact prices before you book.',
    illustration: <PricingIllustration />,
  },
  {
    title: 'On-Time, Every Time',
    desc: "Technicians arrive within the scheduled slot or it's free.",
    illustration: <OnTimeIllustration />,
  },
]

export default function WhyChooseUs() {
  return (
    <section aria-labelledby="why-choose-heading" className="py-12 sm:py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal><h2 id="why-choose-heading" className="text-xl sm:text-2xl font-bold font-brand text-center mb-2" style={{ color: 'var(--color-secondary)' }}>Why Choose HomeCare?</h2></Reveal>
        <Reveal><div className="flex justify-center mb-2"><div style={{ width: 40, height: 3, borderRadius: 2, background: 'var(--color-primary)' }} /></div></Reveal>
        <Reveal><p className="text-muted text-sm text-center mb-10">We go the extra mile to make home services hassle-free</p></Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {features.map((f, i) => (
            <Reveal key={i} delay={i + 1}>
              <div className="feature-card glass-card rounded-2xl p-4 sm:p-5">
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3">
                  {f.illustration}
                </div>
                <h4 className="font-bold font-brand text-xs sm:text-sm mb-1 text-center" style={{ color: 'var(--color-secondary)' }}>{f.title}</h4>
                <p className="text-muted text-xs leading-relaxed text-center">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

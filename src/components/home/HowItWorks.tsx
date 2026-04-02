import Reveal from '../common/Reveal'

const steps = [
  {
    title: 'Browse',
    desc: 'Pick from AC, TV, Fridge & more.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    ),
    bg: 'linear-gradient(135deg,#6D28D9,#7C3AED)',
  },
  {
    title: 'Add to Cart',
    desc: 'Bundle multiple services together.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
    ),
    bg: 'linear-gradient(135deg,#6D28D9,#7C3AED)',
  },
  {
    title: 'Schedule',
    desc: 'Pick date, time & pay securely.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    bg: 'linear-gradient(135deg,#6D28D9,#7C3AED)',
  },
  {
    title: 'Done!',
    desc: 'Technician arrives on time.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    ),
    bg: 'linear-gradient(135deg,#16A34A,#22C55E)',
  },
]

function Arrow({ isLast }: { isLast: boolean }) {
  if (isLast) return null
  return (
    <>
      {/* Horizontal arrow — hidden on mobile */}
      <div className="hidden md:flex items-center justify-center shrink-0 w-10">
        <svg
          className="w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: 'var(--color-primary)' }}
        >
          <path
            d="M5 12h14m0 0l-4-4m4 4l-4 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {/* Vertical arrow — visible only on mobile */}
      <div className="flex md:hidden items-center justify-center py-2">
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          style={{ color: 'var(--color-primary)' }}
        >
          <path
            d="M12 5v14m0 0l-4-4m4 4l4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  )
}

export default function HowItWorks() {
  return (
    <div className="py-12 sm:py-16 bg-surface">
      <div className="max-w-7xl mx-auto px-4">
        <Reveal>
          <h2
            className="text-xl sm:text-2xl font-bold font-brand text-center mb-2"
            style={{ color: 'var(--color-secondary)' }}
          >
            How It Works
          </h2>
        </Reveal>
        <Reveal>
          <div className="flex justify-center mb-2">
            <div
              style={{
                width: 40,
                height: 3,
                borderRadius: 2,
                background: 'var(--color-primary)',
              }}
            />
          </div>
        </Reveal>
        <Reveal>
          <p className="text-muted text-sm text-center mb-10">
            Book a service in 4 simple steps
          </p>
        </Reveal>

        {/* Flow layout: horizontal on desktop, vertical on mobile */}
        <div className="flex flex-col md:flex-row items-center justify-center">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i + 1}>
              <div className="flex flex-col md:flex-row items-center">
                {/* Step card */}
                <div className="glass-how text-center w-52 sm:w-56">
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl flex items-center justify-center text-white shadow-md"
                    style={{ background: s.bg }}
                  >
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      {s.icon}
                    </svg>
                  </div>
                  <h3
                    className="font-bold font-brand text-sm mb-1"
                    style={{ color: 'var(--color-secondary)' }}
                  >
                    {s.title}
                  </h3>
                  <p className="text-muted text-xs">{s.desc}</p>
                </div>

                {/* Arrow connector */}
                <Arrow isLast={i === steps.length - 1} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  )
}

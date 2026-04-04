import { useState } from 'react'
import useStore from '../../store/useStore'

const FAQ_ITEMS = [
  {
    q: 'How do I accept a new job?',
    a: 'Go to My Jobs, find new requests in the "New Requests" tab, and click Accept.',
  },
  {
    q: 'When do I get paid?',
    a: 'Earnings are calculated weekly. Request payouts from the Earnings page. Processing takes 2-3 business days.',
  },
  {
    q: 'How do I update my availability?',
    a: 'Use the Schedule page to set your working hours and block specific dates.',
  },
  {
    q: 'What if I need to cancel a job?',
    a: 'Contact support before the scheduled time. Frequent cancellations may affect your rating.',
  },
]

export default function PartnerSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const showToast = useStore(s => s.showToast)

  const handleSubmit = () => {
    if (!subject || !description) {
      showToast('Please fill all fields', 'warning')
      return
    }
    showToast('Support ticket submitted', 'success')
    setSubject('')
    setDescription('')
  }

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Support</h1>
        <p className="text-muted text-sm mt-1">Find answers or contact our team.</p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-primary mb-3">FAQ</h2>
        <div className="space-y-2">
          {FAQ_ITEMS.map((faq, i) => (
            <div key={faq.q} className="glass-card overflow-hidden">
              <button
                type="button"
                className="w-full p-4 text-left flex items-center justify-between gap-2 min-h-[44px]"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-medium text-primary">{faq.q}</span>
                <svg
                  className={`w-4 h-4 text-muted shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && <div className="px-4 pb-4 text-sm text-secondary fade-in">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-primary mb-3">Contact Support</h2>
        <div className="glass-card p-6 space-y-4">
          <input
            type="text"
            className="input-base w-full py-2.5 px-4 text-sm"
            placeholder="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            maxLength={100}
          />
          <textarea
            className="input-base w-full py-2.5 px-4 text-sm min-h-[100px] resize-y"
            placeholder="Describe your issue..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={500}
          />
          <button type="button" onClick={handleSubmit} className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">
            Submit
          </button>
        </div>
      </section>
    </div>
  )
}

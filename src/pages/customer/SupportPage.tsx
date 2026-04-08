import { useState } from 'react'
import useStore from '../../store/useStore'
import Dropdown from '../../components/common/Dropdown'

const FAQ_ITEMS = [
  {
    q: 'How do I cancel a booking?',
    a: 'Go to My Bookings, find the booking you want to cancel, and click the Cancel button. Cancellations made 4+ hours before the scheduled time are fully refundable.',
  },
  {
    q: 'How long does a refund take?',
    a: 'Refunds are processed within 3-5 business days and credited to your original payment method.',
  },
  {
    q: 'Can I reschedule a booking?',
    a: 'Yes, you can reschedule up to 2 hours before the scheduled service time from the My Bookings page.',
  },
  {
    q: "What if the technician doesn't show up?",
    a: 'Contact support immediately. We will either assign a new technician or process a full refund.',
  },
  {
    q: 'How are prices determined?',
    a: 'Prices are fixed and listed upfront. Additional charges apply only if extra parts or materials are needed, with your approval.',
  },
]

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const showToast = useStore(s => s.showToast)

  const handleSubmit = () => {
    if (!subject || !category || !description) {
      showToast('Please fill all fields', 'warning')
      return
    }
    showToast('Support ticket submitted successfully', 'success')
    setSubject('')
    setCategory('')
    setDescription('')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-primary mb-6">Help & Support</h1>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-primary mb-3">Frequently Asked Questions</h2>
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
        <h2 className="text-base font-semibold text-primary mb-3">Raise a Ticket</h2>
        <div className="glass-card p-6 space-y-4">
          <div>
            <label htmlFor="support-subject" className="text-xs font-semibold text-secondary block mb-1">
              Subject
            </label>
            <input
              id="support-subject"
              type="text"
              className="input-base w-full py-2.5 px-4 text-sm"
              placeholder="Brief description of your issue"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              maxLength={100}
            />
          </div>
          <Dropdown
            options={[
              { value: 'booking', label: 'Booking Issue' },
              { value: 'payment', label: 'Payment / Refund' },
              { value: 'service', label: 'Service Quality' },
              { value: 'other', label: 'Other' },
            ]}
            value={category}
            onChange={setCategory}
            placeholder="Select category"
            label="Category"
            id="support-category"
          />
          <div>
            <label htmlFor="support-desc" className="text-xs font-semibold text-secondary block mb-1">
              Description
            </label>
            <textarea
              id="support-desc"
              className="input-base w-full py-2.5 px-4 text-sm min-h-[100px] resize-y"
              placeholder="Describe your issue in detail..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>
          <button type="button" onClick={handleSubmit} className="btn-base btn-primary px-6 py-2.5 text-sm min-h-[44px]">
            Submit Ticket
          </button>
        </div>
      </section>
    </div>
  )
}

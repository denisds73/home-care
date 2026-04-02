import { useState } from 'react'

export default function RazorpayModal({ amount, onSuccess, onClose }) {
  const [state, setState] = useState('methods') // methods | processing | success | failed
  const [selected, setSelected] = useState(0)
  const [orderId, setOrderId] = useState('')

  const methods = [
    { icon: '📱', name: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
    { icon: '💳', name: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
    { icon: '🏦', name: 'Net Banking', desc: 'All major banks' },
  ]

  const simulatePayment = () => {
    setOrderId('rzp_order_' + Math.random().toString(36).slice(2, 13))
    setState('processing')
    setTimeout(() => { setState(Math.random() < 0.8 ? 'success' : 'failed') }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]">
      <div className="bg-card border border-default rounded-2xl shadow-xl w-full max-w-sm overflow-hidden scale-in">
        {/* Header */}
        <div className="px-5 py-4 text-white rzp-header">
          <div className="flex items-center justify-between">
            <div><p className="text-xs opacity-80">HomeCare Services</p><h3 className="text-lg font-bold">Payment</h3></div>
            <button onClick={onClose} className="text-white opacity-80 hover:opacity-100" aria-label="Close payment"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
          <p className="text-2xl font-extrabold mt-1">₹{amount}</p>
        </div>

        <div className="p-5">
          {state === 'methods' && (
            <>
              <p className="text-sm font-medium text-secondary mb-3">Select Payment Method</p>
              <div className="space-y-2 mb-5">
                {methods.map((m, i) => (
                  <button key={i} onClick={() => setSelected(i)}
                    className={`w-full rounded-lg p-3 flex items-center gap-3 border-2 transition text-left ${i === selected ? 'border-brand bg-brand-soft' : 'border-gray-200 hover:border-brand hover:bg-brand-soft'}`}>
                    <div className="w-8 h-8 bg-brand-soft rounded-full flex items-center justify-center text-sm">{m.icon}</div>
                    <div><p className="font-medium text-sm">{m.name}</p><p className="text-xs text-muted">{m.desc}</p></div>
                  </button>
                ))}
              </div>
              <button onClick={simulatePayment} className="btn-base btn-primary w-full py-3 rounded-xl font-semibold text-sm text-white">Pay Securely</button>
            </>
          )}

          {state === 'processing' && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-3 border-gray-200 rounded-full mx-auto mb-4" style={{ animation: 'spin .8s linear infinite', borderTopColor: 'var(--color-primary)' }} />
              <p className="font-medium text-secondary">Processing payment...</p>
              <p className="text-xs text-muted mt-1">Please do not close this window</p>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center bg-green-100">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <p className="font-bold text-lg text-success">Payment Successful!</p>
              <p className="text-xs text-muted mt-1 font-mono">Order: {orderId}</p>
              <button onClick={onSuccess} className="btn-base btn-success text-white w-full py-3 rounded-xl font-semibold text-sm mt-4">Continue</button>
            </div>
          )}

          {state === 'failed' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center bg-red-100">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </div>
              <p className="font-bold text-lg text-error">Payment Failed</p>
              <p className="text-sm text-secondary mt-1">Transaction could not be completed.</p>
              <div className="space-y-2 mt-5">
                <button onClick={() => setState('methods')} className="btn-base btn-primary w-full py-3 rounded-xl font-semibold text-sm text-white">Retry Payment</button>
                <button onClick={onClose} className="btn-base btn-secondary w-full py-2.5 rounded-xl font-semibold text-sm border-2 border-brand text-brand hover:bg-muted transition">Pay After Service</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

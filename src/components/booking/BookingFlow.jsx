import { useState, useRef, useEffect } from 'react'
import useStore from '../../store/useStore'
import { CATEGORIES } from '../../data/categories'
import { CONVENIENCE_FEE, GST_RATE } from '../../data/services'
import RazorpayModal from './RazorpayModal'
import LoginScreen from '../auth/LoginScreen'

const stepLabels = ['Details', 'Verify', 'Payment', 'Done']

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center mb-10">
      <div className="flex items-center">
        {stepLabels.map((label, i) => {
          const step = i + 1
          const isDone = step < current
          const isActive = step === current
          return (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${isDone ? 'step-done' : isActive ? 'step-active' : 'step-pending'}`}>
                  {isDone ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg> : step}
                </div>
                <p className={`text-[.6rem] mt-1 whitespace-nowrap ${isActive ? 'text-brand font-semibold' : isDone ? 'text-success' : 'text-muted'}`}>{label}</p>
              </div>
              {i < 3 && <div className={`w-6 sm:w-12 h-1 mb-5 ${isDone ? 'bg-success' : 'bg-gray-200'}`} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Step1({ onNext, booking, setBooking }) {
  const cart = useStore(s => s.cart)
  const getCartTotal = useStore(s => s.getCartTotal)
  const getCartCount = useStore(s => s.getCartCount)
  const [errors, setErrors] = useState({})
  const [selectedSlot, setSelectedSlot] = useState(booking.time_slot || '')

  const validate = () => {
    const e = {}
    if (!booking.name?.trim() || booking.name.trim().length < 2) e.name = 'Full name is required (min 2 chars)'
    if (!booking.phone?.trim() || !/^[6-9]\d{9}$/.test(booking.phone.trim())) e.phone = 'Enter a valid 10-digit Indian mobile number'
    if (!booking.address?.trim()) e.address = 'Address is required'
    if (!booking.date) e.date = 'Please select a date'
    if (!selectedSlot) e.slot = 'Please select a time slot'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      setBooking(b => ({ ...b, time_slot: selectedSlot }))
      onNext()
    }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const slots = [
    { value: '9AM-12PM', time: '9:00 AM', end: 'to 12:00 PM', tag: 'Fastest', tagColor: '#6D28D9' },
    { value: '12PM-3PM', time: '12:00 PM', end: 'to 3:00 PM', tag: 'Available', tagColor: '#16A34A' },
    { value: '3PM-6PM', time: '3:00 PM', end: 'to 6:00 PM', tag: 'Available', tagColor: '#16A34A' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 md:p-8 slide-up">
      <h3 className="text-xl font-bold mb-1 text-primary">Booking Details</h3>
      <p className="text-secondary text-sm mb-4">Fill in your details to book the selected services</p>

      {/* Cart summary */}
      <div className="border-2 border-brand rounded-xl p-4 mb-6 bg-muted space-y-2">
        {cart.map(c => (
          <div key={c.service.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm">{CATEGORIES.find(cat => cat.id === c.service.category)?.icon}</span>
              <span className="text-sm font-medium truncate">{c.service.service_name}{c.qty > 1 ? ` × ${c.qty}` : ''}</span>
            </div>
            <span className="text-sm font-bold shrink-0 text-brand-dark">₹{c.service.price * c.qty}</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-brand/20 pt-2 mt-2">
          <span className="text-sm font-bold text-primary">{getCartCount()} service{getCartCount() > 1 ? 's' : ''}</span>
          <span className="text-sm font-extrabold text-brand-dark">₹{getCartTotal()}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Full Name <span className="text-error">*</span></label>
          <input type="text" value={booking.name || ''} onChange={e => setBooking(b => ({ ...b, name: e.target.value }))}
            className={`input-base w-full px-4 py-2.5 text-sm ${errors.name ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            placeholder="Enter your full name" />
          {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Phone Number <span className="text-error">*</span></label>
          <input type="tel" maxLength="10" value={booking.phone || ''} onChange={e => setBooking(b => ({ ...b, phone: e.target.value }))}
            className={`input-base w-full px-4 py-2.5 text-sm ${errors.phone ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            placeholder="10-digit mobile number" inputMode="numeric" />
          {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Address <span className="text-error">*</span></label>
          <textarea rows="2" value={booking.address || ''} onChange={e => setBooking(b => ({ ...b, address: e.target.value }))}
            className={`input-base w-full px-4 py-2.5 text-sm ${errors.address ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            placeholder="Enter your complete address" />
          {errors.address && <p className="text-xs text-error mt-1">{errors.address}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Preferred Date <span className="text-error">*</span></label>
          <input type="date" min={minDate} value={booking.date || ''} onChange={e => setBooking(b => ({ ...b, date: e.target.value }))}
            className={`input-base w-full px-4 py-2.5 text-sm ${errors.date ? 'border-red-400 ring-2 ring-red-100' : ''}`} />
          {errors.date && <p className="text-xs text-error mt-1">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">Time Slot <span className="text-error">*</span></label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {slots.map(slot => (
              <button key={slot.value} onClick={() => { setSelectedSlot(slot.value); setErrors(e => ({ ...e, slot: undefined })) }}
                className={`p-2 sm:p-3 border-2 rounded-xl text-center transition ${selectedSlot === slot.value ? 'border-brand bg-muted shadow-[0_0_0_3px_rgba(109,40,217,.16)]' : 'border-gray-200 hover:border-brand hover:bg-muted'}`}>
                <div className="text-[.8rem] font-bold text-primary">{slot.time}</div>
                <div className="text-[.65rem] text-muted">{slot.end}</div>
                <div className="text-[.65rem] font-semibold mt-1" style={{ color: slot.tagColor }}>{slot.tag}</div>
              </button>
            ))}
          </div>
          {errors.slot && <p className="text-xs text-error mt-1">{errors.slot}</p>}
        </div>
      </div>
      <button onClick={handleSubmit} className="btn-base btn-primary w-full py-3 font-semibold mt-6 text-sm">Continue to Verify Phone</button>
    </div>
  )
}

function Step2({ onNext, phone }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(300)
  const refs = useRef([])
  const showToast = useStore(s => s.showToast)

  useEffect(() => {
    refs.current[0]?.focus()
    const interval = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    setError('')
    if (val && idx < 5) refs.current[idx + 1]?.focus()
  }

  const handleKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus()
  }

  const verify = () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Please enter all 6 digits'); return }
    if (code !== '123456') { setError('Invalid OTP. Please try again.'); return }
    showToast('Phone verified!', 'success')
    onNext()
  }

  const mm = String(Math.floor(timer / 60)).padStart(2, '0')
  const ss = String(timer % 60).padStart(2, '0')

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 md:p-8 slide-up">
      <h3 className="text-xl font-bold mb-1 text-primary">OTP Verification</h3>
      <p className="text-secondary text-sm mb-6">Enter the 6-digit OTP sent to {phone}</p>
      <div className="flex justify-center mb-3 gap-1.5 sm:gap-2">
        {otp.map((d, i) => (
          <input key={i} ref={el => refs.current[i] = el} type="text" inputMode="numeric" maxLength="1" value={d}
            onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKey(i, e)}
            className="w-10 h-12 sm:w-12 sm:h-14 border-2 border-gray-300 rounded-lg text-center text-lg sm:text-xl font-bold focus:outline-none focus:border-brand" />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mb-2 px-3 py-2 rounded-lg text-xs bg-muted text-brand">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span>Demo Mode — OTP is <strong>123456</strong></span>
      </div>
      <p className={`text-center font-mono text-lg font-bold mb-3 ${timer <= 30 ? 'text-error' : 'text-brand'}`}>{mm}:{ss}</p>
      {error && <p className="text-error text-sm text-center mb-3">{error}</p>}
      <button onClick={verify} disabled={timer === 0} className="btn-base btn-primary w-full py-3 font-semibold text-sm disabled:bg-gray-300 disabled:cursor-not-allowed">Verify OTP</button>
      <button onClick={() => { setTimer(300); setOtp(['','','','','','']); showToast('OTP resent', 'info') }} disabled={timer > 0}
        className={`w-full py-2 text-sm mt-2 ${timer > 0 ? 'text-muted cursor-not-allowed' : 'text-brand font-medium cursor-pointer hover:text-brand-dark'}`}>Resend OTP</button>
    </div>
  )
}

function Step3({ booking, onPayNow, onPayAfter }) {
  const cart = useStore(s => s.cart)
  const getCartTotal = useStore(s => s.getCartTotal)
  const subtotal = getCartTotal()
  const gst = Math.round(subtotal * GST_RATE)
  const total = subtotal + CONVENIENCE_FEE + gst

  const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
  const formatSlot = (s) => s === '9AM-12PM' ? '9:00 AM – 12:00 PM' : s === '12PM-3PM' ? '12:00 PM – 3:00 PM' : '3:00 PM – 6:00 PM'

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 md:p-8 slide-up">
      <h3 className="text-xl font-bold mb-1 text-primary">Booking Summary</h3>
      <p className="text-secondary text-sm mb-6">Review your booking details before payment</p>

      <div className="space-y-2 mb-4">
        {cart.map(c => (
          <div key={c.service.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-primary">{c.service.service_name}</p>
              <p className="text-xs text-muted">{CATEGORIES.find(cat => cat.id === c.service.category)?.name}{c.qty > 1 ? ` × ${c.qty}` : ''}</p>
            </div>
            <p className="font-bold text-sm shrink-0 text-brand-dark">₹{c.service.price * c.qty}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-muted">Customer</p><p className="font-semibold text-sm">{booking.name}</p></div>
        <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-muted">Phone</p><p className="font-semibold text-sm">{booking.phone}</p></div>
        <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-muted">Date</p><p className="font-semibold text-sm">{formatDate(booking.date)}</p></div>
        <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-muted">Time Slot</p><p className="font-semibold text-sm">{formatSlot(booking.time_slot)}</p></div>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 mb-4"><p className="text-xs text-muted">Address</p><p className="font-semibold text-sm">{booking.address}</p></div>

      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h4 className="text-sm font-semibold text-secondary mb-2">Pricing Breakdown</h4>
        {cart.map(c => (
          <div key={c.service.id} className="flex justify-between py-1 text-sm"><span className="text-secondary">{c.service.service_name}{c.qty > 1 ? ` × ${c.qty}` : ''}</span><span className="font-semibold">₹{c.service.price * c.qty}</span></div>
        ))}
        <div className="flex justify-between py-1 text-sm"><span className="text-secondary">Convenience Fee</span><span className="font-semibold">₹{CONVENIENCE_FEE}</span></div>
        <div className="flex justify-between py-1 text-sm"><span className="text-secondary">GST (18%)</span><span className="font-semibold">₹{gst}</span></div>
        <div className="flex justify-between py-2 text-base font-extrabold border-t-2 border-gray-200 mt-1"><span className="text-primary">Total Amount</span><span className="text-brand-dark">₹{total}</span></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={() => onPayNow(total)} className="btn-base btn-primary py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
          Pay Now
        </button>
        <button onClick={onPayAfter} className="btn-base btn-secondary py-3 rounded-xl font-semibold text-sm">Pay After Service</button>
      </div>
    </div>
  )
}

function Step4({ bookingId, booking }) {
  const setView = useStore(s => s.setView)
  const clearCart = useStore(s => s.clearCart)
  const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 md:p-8 slide-up text-center">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-green-100">
        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
      </div>
      <h3 className="text-2xl font-bold mb-2 text-primary">Booking Confirmed!</h3>
      <p className="text-secondary mb-1">Your services have been booked successfully.</p>
      <p className="text-sm font-medium mb-6 text-brand">Our team will contact you shortly to confirm your appointment.</p>
      <div className="bg-gray-50 rounded-xl p-5 text-left mb-6 space-y-2.5">
        <div className="flex justify-between"><span className="text-secondary text-sm">Booking ID</span><span className="font-bold text-sm text-brand-dark">{bookingId}</span></div>
        <div className="flex justify-between"><span className="text-secondary text-sm">Date</span><span className="font-semibold text-sm">{formatDate(booking.date)}</span></div>
        <div className="flex justify-between"><span className="text-secondary text-sm">Address</span><span className="font-semibold text-sm text-right max-w-xs">{booking.address}</span></div>
      </div>
      <button onClick={() => { clearCart(); setView('home') }} className="btn-base btn-primary px-8 py-3 font-semibold text-sm">Back to Home</button>
    </div>
  )
}

export default function BookingFlow() {
  const { setView, addBooking, cart } = useStore()
  const isLoggedIn = useStore(s => s.isLoggedIn)
  const [step, setStep] = useState(1)
  const [booking, setBooking] = useState({})
  const [showRazorpay, setShowRazorpay] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [payAmount, setPayAmount] = useState(0)
  const [confirmedId, setConfirmedId] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const showToast = useStore(s => s.showToast)

  const goBack = () => {
    if (step <= 1) setView('home')
    else setStep(s => Math.max(1, s - 1))
  }

  const createBooking = (paymentMode, paymentStatus) => {
    const id = addBooking({
      customer_name: booking.name,
      phone: booking.phone,
      address: booking.address,
      lat: 12.9716, lng: 77.5946,
      category: cart[0]?.service.category || '',
      service_id: cart[0]?.service.id,
      service_name: cart.map(c => c.service.service_name).join(', '),
      price: useStore.getState().getCartTotal(),
      services_list: cart.map(c => ({ id: c.service.id, name: c.service.service_name, price: c.service.price, qty: c.qty })),
      preferred_date: booking.date,
      time_slot: booking.time_slot,
      payment_mode: paymentMode,
      payment_status: paymentStatus,
      booking_status: 'Pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    setConfirmedId(id)
    return id
  }

  const handlePayNow = (amount) => {
    if (!isLoggedIn) {
      setPendingAction({ type: 'payNow', amount })
      setShowAuth(true)
      showToast('Log in or sign up to continue payment', 'info')
      return
    }
    setPayAmount(amount)
    setShowRazorpay(true)
  }

  const handlePaymentSuccess = () => {
    setShowRazorpay(false)
    const id = createBooking('PAY_NOW', 'SUCCESS')
    setStep(4)
    showToast(`Booking ${id} created!`, 'success')
  }

  const handlePayAfter = () => {
    if (!isLoggedIn) {
      setPendingAction({ type: 'payAfter' })
      setShowAuth(true)
      showToast('Log in or sign up to place booking', 'info')
      return
    }
    const id = createBooking('PAY_AFTER_SERVICE', 'PENDING')
    setStep(4)
    showToast(`Booking ${id} created!`, 'success')
  }

  const handleAuthSuccess = () => {
    setShowAuth(false)
    const action = pendingAction
    setPendingAction(null)
    if (!action) return
    if (action.type === 'payNow') {
      setPayAmount(action.amount)
      setShowRazorpay(true)
      return
    }
    const id = createBooking('PAY_AFTER_SERVICE', 'PENDING')
    setStep(4)
    showToast(`Booking ${id} created!`, 'success')
  }

  return (
    <div className="fade-in">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={goBack} className="btn-base btn-secondary inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back
        </button>

        <StepIndicator current={step} />

        {step === 1 && <Step1 onNext={() => { setStep(2); showToast('OTP sent to ' + booking.phone, 'info') }} booking={booking} setBooking={setBooking} />}
        {step === 2 && <Step2 onNext={() => setStep(3)} phone={booking.phone} />}
        {step === 3 && <Step3 booking={booking} onPayNow={handlePayNow} onPayAfter={handlePayAfter} />}
        {step === 4 && <Step4 bookingId={confirmedId} booking={booking} />}

        {showRazorpay && <RazorpayModal amount={payAmount} onSuccess={handlePaymentSuccess} onClose={() => setShowRazorpay(false)} />}
        {showAuth && <LoginScreen onAuthSuccess={handleAuthSuccess} onClose={() => { setShowAuth(false); setPendingAction(null) }} />}
      </div>
    </div>
  )
}

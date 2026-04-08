import { useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'
import { useAuthStore } from '../../store/useAuthStore'
import { bookingService } from '../../services/bookingService'
import { useLocationStore } from '../../store/useLocationStore'
import { CATEGORIES } from '../../data/categories'
import { calculatePricing } from '../../utils/pricing'
import type { PaymentMode, TimeSlot } from '../../types/domain'
import RazorpayModal from './RazorpayModal'
import { LOGIN_ROUTES } from '../../lib/auth'
import { DatePicker } from '../common/DatePicker'

const DRAFT_KEY = 'hc_booking_draft'
const stepLabels = ['Details', 'Payment', 'Done']

interface BookingDraft {
  name?: string
  phone?: string
  address?: string
  date?: string
  time_slot?: string
}

const SLOT_LABELS: Record<string, string> = {
  '9AM-12PM': '9:00 AM – 12:00 PM',
  '12PM-3PM': '12:00 PM – 3:00 PM',
  '3PM-6PM': '3:00 PM – 6:00 PM',
}

function formatSlot(s: string | undefined): string {
  return s ? (SLOT_LABELS[s] ?? s) : ''
}

function formatDate(d: string | undefined): string {
  return d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

function StepIndicator({ current }: { current: number }) {
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
              {i < stepLabels.length - 1 && <div className={`w-6 sm:w-12 h-1 mb-5 ${isDone ? 'bg-success' : 'bg-gray-200'}`} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DetailsStep({
  onNext,
  booking,
  setBooking,
}: {
  onNext: () => void
  booking: BookingDraft
  setBooking: Dispatch<SetStateAction<BookingDraft>>
}) {
  const cart = useStore(s => s.cart)
  const getCartTotal = useStore(s => s.getCartTotal)
  const getCartCount = useStore(s => s.getCartCount)
  const savedLocation = useLocationStore(s => s.location)
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [selectedSlot, setSelectedSlot] = useState(booking.time_slot || '')

  const validate = () => {
    const e: Record<string, string | undefined> = {}
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

  const slots: { value: TimeSlot; time: string; end: string; tag: string; tagColor: string }[] = [
    { value: '9AM-12PM', time: '9:00 AM', end: 'to 12:00 PM', tag: 'Fastest', tagColor: '#6D28D9' },
    { value: '12PM-3PM', time: '12:00 PM', end: 'to 3:00 PM', tag: 'Available', tagColor: '#16A34A' },
    { value: '3PM-6PM', time: '3:00 PM', end: 'to 6:00 PM', tag: 'Available', tagColor: '#16A34A' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 md:p-8 slide-up">
      <h3 className="text-xl font-bold mb-1 text-primary">Booking Details</h3>
      <p className="text-secondary text-sm mb-4">Fill in your details to book the selected services</p>

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
          <input type="tel" maxLength={10} value={booking.phone || ''} onChange={e => setBooking(b => ({ ...b, phone: e.target.value }))}
            className={`input-base w-full px-4 py-2.5 text-sm ${errors.phone ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            placeholder="10-digit mobile number" inputMode="numeric" />
          {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Address <span className="text-error">*</span></label>
          <textarea rows={2} value={booking.address || ''} onChange={e => setBooking(b => ({ ...b, address: e.target.value }))}
            className={`input-base w-full px-4 py-2.5 text-sm ${errors.address ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            placeholder="Enter your complete address" />
          {errors.address && <p className="text-xs text-error mt-1">{errors.address}</p>}
          {savedLocation && booking.address !== savedLocation.fullAddress && (
            <button
              type="button"
              onClick={() => setBooking(b => ({ ...b, address: savedLocation.fullAddress }))}
              className="text-xs text-brand font-medium mt-1 hover:underline"
            >
              Use saved location
            </button>
          )}
        </div>
        <DatePicker
          id="booking-date"
          label="Preferred Date"
          value={booking.date ?? null}
          onChange={(date) => { setBooking(b => ({ ...b, date })); setErrors(er => ({ ...er, date: undefined })) }}
          minDate={minDate}
          placeholder="Select a date"
          error={errors.date}
        />
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">Time Slot <span className="text-error">*</span></label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {slots.map(slot => (
              <button key={slot.value} type="button" onClick={() => { setSelectedSlot(slot.value); setErrors(er => ({ ...er, slot: undefined })) }}
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
      <button type="button" onClick={handleSubmit} className="btn-base btn-primary w-full py-3 font-semibold mt-6 text-sm">Continue to Payment</button>
    </div>
  )
}

function PaymentAuthGate({ booking }: { booking: BookingDraft }) {
  const navigate = useNavigate()

  const handleLoginRedirect = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(booking))
    navigate(`${LOGIN_ROUTES.customer}?returnTo=${encodeURIComponent('/app/booking')}`)
  }

  return (
    <div className="glass-card p-5 slide-up">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h4 className="text-base font-bold text-primary">Sign in to complete booking</h4>
      </div>
      <p className="text-sm text-secondary mb-4">
        Log in or create an account to proceed with payment. Your booking details will be preserved.
      </p>
      <button
        type="button"
        onClick={handleLoginRedirect}
        className="btn-base btn-primary w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Login &amp; Pay
      </button>
    </div>
  )
}


function PaymentStep({
  booking,
  onPayNow,
  onPayAfter,
  submitting,
}: {
  booking: BookingDraft
  onPayNow: (amount: number) => void
  onPayAfter: () => void
  submitting: boolean
}) {
  const cart = useStore(s => s.cart)
  const pricing = calculatePricing(cart)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)


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
        <div className="flex justify-between py-1 text-sm"><span className="text-secondary">Convenience Fee</span><span className="font-semibold">₹{pricing.convenienceFee}</span></div>
        <div className="flex justify-between py-1 text-sm"><span className="text-secondary">GST (18%)</span><span className="font-semibold">₹{pricing.gst}</span></div>
        <div className="flex justify-between py-2 text-base font-extrabold border-t-2 border-gray-200 mt-1"><span className="text-primary">Total Amount</span><span className="text-brand-dark">₹{pricing.grandTotal}</span></div>
      </div>

      {!isAuthenticated ? (
        <PaymentAuthGate booking={booking} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button type="button" onClick={() => onPayNow(pricing.grandTotal)} disabled={submitting} className="btn-base btn-primary py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            )}
            {submitting ? 'Processing...' : 'Pay Now'}
          </button>
          <button type="button" onClick={onPayAfter} disabled={submitting} className="btn-base btn-secondary py-3 rounded-xl font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? 'Processing...' : 'Pay After Service'}
          </button>
        </div>
      )}
    </div>
  )
}

function ConfirmationStep({ bookingId, booking }: { bookingId: string; booking: BookingDraft }) {
  const navigate = useNavigate()
  const clearCart = useStore(s => s.clearCart)

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
        <div className="flex justify-between"><span className="text-secondary text-sm">Time Slot</span><span className="font-semibold text-sm">{booking.time_slot}</span></div>
        <div className="flex justify-between"><span className="text-secondary text-sm">Address</span><span className="font-semibold text-sm text-right max-w-xs">{booking.address}</span></div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={() => { clearCart(); navigate('/app/bookings') }} className="btn-base btn-primary flex-1 px-6 py-3 font-semibold text-sm">
          View My Bookings
        </button>
        <button type="button" onClick={() => { clearCart(); navigate('/app') }} className="btn-base btn-secondary flex-1 px-6 py-3 font-semibold text-sm">
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default function BookingFlow() {
  const navigate = useNavigate()
  const addBooking = useStore(s => s.addBooking)
  const cart = useStore(s => s.cart)
  const [step, setStep] = useState(1)
  const user = useAuthStore(s => s.user)
  const authLoading = useAuthStore(s => s.isLoading)

  // Restore booking draft from localStorage if returning from auth redirect
  const [booking, setBooking] = useState<BookingDraft>(() => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) {
      localStorage.removeItem(DRAFT_KEY)
      try { return JSON.parse(saved) as BookingDraft } catch { /* fall through */ }
    }
    return {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      address: useLocationStore.getState().location?.fullAddress ?? '',
      date: '',
      time_slot: '',
    }
  })
  const [showRazorpay, setShowRazorpay] = useState(false)
  const [payAmount, setPayAmount] = useState(0)
  const [confirmedId, setConfirmedId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const showToast = useStore(s => s.showToast)

  // Redirect to home if cart is empty (unless on confirmation step)
  useEffect(() => {
    if (cart.length === 0 && step !== 3) {
      navigate('/app', { replace: true })
    }
  }, [cart.length, step, navigate])

  // Pre-fill name/phone once when user becomes available after async auth restore.
  // This syncs external auth state into local form state — a valid use of setState in effect.
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing external auth state
      setBooking(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
      }))
    }
  }, [user])

  const goBack = () => {
    if (step <= 1) navigate('/app')
    else setStep(s => Math.max(1, s - 1))
  }

  const buildPayload = (paymentMode: PaymentMode) => {
    const categories = [...new Set(cart.map(c => c.service.category))]
    return {
      customer_name: booking.name ?? '',
      phone: booking.phone ?? '',
      address: booking.address ?? '',
      lat: Number(useLocationStore.getState().location?.lat ?? 12.9716),
      lng: Number(useLocationStore.getState().location?.lng ?? 77.5946),
      category: categories.length === 1 ? categories[0] : categories.join(','),
      service_id: cart.length === 1 ? cart[0].service.id : undefined,
      service_name: cart.map(c => c.service.service_name).join(', '),
      price: calculatePricing(cart).grandTotal,
      services_list: cart.map(c => ({
        id: c.service.id,
        name: c.service.service_name,
        price: Number(c.service.price),
        qty: c.qty,
      })),
      preferred_date: booking.date ?? '',
      time_slot: booking.time_slot ?? '',
      payment_mode: paymentMode,
    }
  }

  const createBooking = async (paymentMode: PaymentMode): Promise<string | null> => {
    const payload = buildPayload(paymentMode)
    setSubmitting(true)
    setBookingError(null)
    try {
      const response = await bookingService.createBooking(payload)
      const created = response.data
      const id = created.booking_id
      addBooking({
        ...payload,
        payment_status: created.payment_status ?? 'PENDING',
        razorpay_order_id: created.razorpay_order_id ?? null,
        booking_status: created.booking_status ?? 'pending',
        created_at: created.created_at ?? new Date().toISOString(),
        updated_at: created.updated_at ?? new Date().toISOString(),
      })
      setConfirmedId(id)
      setSubmitting(false)
      return id
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong'
      setBookingError(message)
      showToast(`Booking failed: ${message}. Please try again.`, 'danger')
      setSubmitting(false)
      return null
    }
  }

  const handlePayNow = (amount: number) => {
    setPayAmount(amount)
    setShowRazorpay(true)
  }

  const handlePaymentSuccess = async () => {
    setShowRazorpay(false)
    const id = await createBooking('PAY_NOW')
    if (id) {
      setStep(3)
      showToast(`Booking ${id} created!`, 'success')
    }
  }

  const handlePayAfter = async () => {
    const id = await createBooking('PAY_AFTER_SERVICE')
    if (id) {
      setStep(3)
      showToast(`Booking ${id} created!`, 'success')
    }
  }

  const handlePayAfterFromModal = async () => {
    setShowRazorpay(false)
    await handlePayAfter()
  }

  // Show skeleton while auth is restoring so form never flashes empty then prefills
  if (authLoading && step === 1) {
    return (
      <div className="fade-in">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 md:p-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i}><div className="h-4 bg-gray-200 rounded w-24 mb-1" /><div className="h-10 bg-gray-100 rounded-lg" /></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button type="button" onClick={goBack} className="btn-base btn-secondary inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back
        </button>

        <StepIndicator current={step} />

        {step === 1 && <DetailsStep onNext={() => setStep(2)} booking={booking} setBooking={setBooking} />}
        {step === 2 && (
          <>
            <PaymentStep booking={booking} onPayNow={handlePayNow} onPayAfter={handlePayAfter} submitting={submitting} />
            {bookingError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-center slide-up">
                <p className="text-sm text-error font-medium">{bookingError}</p>
                <button type="button" onClick={() => setBookingError(null)} className="text-xs text-brand font-medium mt-2 hover:underline">Dismiss</button>
              </div>
            )}
          </>
        )}
        {step === 3 && <ConfirmationStep bookingId={confirmedId} booking={booking} />}

        {showRazorpay && (
          <RazorpayModal
            amount={payAmount}
            onSuccess={handlePaymentSuccess}
            onClose={() => setShowRazorpay(false)}
            onPayAfter={handlePayAfterFromModal}
          />
        )}
      </div>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { bookingService } from '../../services/bookingService'
import { StatusTimeline } from '../../components/bookings/StatusTimeline'
import { StatusBadge } from '../../components/bookings/StatusBadge'
import { formatDate } from '../../data/helpers'
import useStore from '../../store/useStore'
import type { Booking, BookingStatusEvent } from '../../types/domain'
import { ReportDelaySheet, CannotAttendSheet, SmartDelayPrompt } from '../../components/delay'

export default function TechnicianJobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const showToast = useStore((s) => s.showToast)

  const [booking, setBooking] = useState<Booking | null>(null)
  const [events, setEvents] = useState<BookingStatusEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [busy, setBusy] = useState<'start' | 'complete' | null>(null)
  const [showDelaySheet, setShowDelaySheet] = useState(false)
  const [showCannotAttend, setShowCannotAttend] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      setError(null)
      const [b, ev] = await Promise.all([
        bookingService.getById(id),
        bookingService.getEvents(id),
      ])
      setBooking(b)
      setEvents(ev)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handleStart = async () => {
    if (!id) return
    setBusy('start')
    try {
      await bookingService.start(id)
      showToast('Job started — ask the customer for the OTP', 'success')
      await load()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to start', 'danger')
    } finally {
      setBusy(null)
    }
  }

  const handleComplete = async () => {
    if (!id) return
    setOtpError(null)
    if (!/^\d{6}$/.test(otp)) {
      setOtpError('Enter the 6-digit code from the customer')
      return
    }
    setBusy('complete')
    try {
      await bookingService.complete(id, { otp })
      showToast('Job completed', 'success')
      setOtp('')
      await load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to complete'
      setOtpError(msg)
      showToast(msg, 'danger')
    } finally {
      setBusy(null)
    }
  }

  if (isLoading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-5 w-48 bg-surface rounded mb-3" />
        <div className="h-3 w-64 bg-surface rounded" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-error text-sm mb-3">{error ?? 'Job not found'}</p>
        <Link
          to="/technician/jobs"
          className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
        >
          Back to jobs
        </Link>
      </div>
    )
  }

  const s = booking.booking_status
  const canStart = s === 'accepted'
  const canComplete = s === 'in_progress'
  const isDone = s === 'completed'

  const mapsHref = `https://maps.google.com/?q=${encodeURIComponent(
    booking.address,
  )}`

  return (
    <div className="fade-in space-y-4">
      <div>
        <Link
          to="/technician/jobs"
          className="text-xs text-muted hover:text-primary"
        >
          ← Back to jobs
        </Link>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <h1 className="font-brand text-lg font-bold text-primary">
              {booking.service_name}
            </h1>
            <p className="text-xs text-muted mt-1">#{booking.booking_id}</p>
          </div>
          <StatusBadge status={s} />
        </div>

        <div className="grid grid-cols-1 gap-3 mt-4 text-sm">
          <div>
            <p className="text-muted text-xs">Customer</p>
            <p className="text-secondary font-medium">{booking.customer_name}</p>
            <a
              href={`tel:${booking.phone}`}
              className="text-xs text-brand font-semibold inline-block mt-1"
              aria-label={`Call ${booking.customer_name}`}
            >
              {booking.phone} · Call
            </a>
          </div>
          <div>
            <p className="text-muted text-xs">When</p>
            <p className="text-secondary font-medium">
              {formatDate(booking.preferred_date)} · {booking.time_slot}
            </p>
          </div>
          <div>
            <p className="text-muted text-xs">Address</p>
            <p className="text-secondary">{booking.address}</p>
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-brand font-semibold inline-block mt-1"
            >
              Open in Maps
            </a>
          </div>
          <div>
            <p className="text-muted text-xs">Amount</p>
            <p className="font-brand font-bold text-brand">
              ₹{booking.price.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      <SmartDelayPrompt
        scheduledTime={booking.time_slot}
        preferredDate={booking.preferred_date}
        bookingStatus={s}
        startedAt={booking.started_at ?? null}
        onReportDelay={() => setShowDelaySheet(true)}
        onStartService={handleStart}
      />

      {canStart && (
        <button
          type="button"
          onClick={handleStart}
          disabled={busy !== null}
          className="btn-base btn-primary w-full py-3 text-sm font-semibold min-h-[48px] disabled:opacity-60"
        >
          {busy === 'start' ? 'Starting…' : 'Start Job'}
        </button>
      )}

      {/* Delay reporting — visible when accepted or in_progress */}
      {(canStart || canComplete) && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowDelaySheet(true)}
            disabled={busy !== null}
            className="btn-base flex-1 py-3 text-sm font-bold min-h-[48px] bg-[#D97706] text-white hover:bg-[#B45309] active:scale-[0.97] disabled:opacity-60 transition-all"
          >
            Report Delay
          </button>
          <button
            type="button"
            onClick={() => setShowCannotAttend(true)}
            disabled={busy !== null}
            className="btn-base py-3 text-sm font-bold min-h-[48px] border-[1.5px] border-error text-error hover:bg-error-soft disabled:opacity-60 px-4"
          >
            Cannot Attend
          </button>
        </div>
      )}

      <ReportDelaySheet
        isOpen={showDelaySheet}
        onClose={() => setShowDelaySheet(false)}
        bookingId={booking.booking_id}
        onSuccess={load}
      />
      <CannotAttendSheet
        isOpen={showCannotAttend}
        onClose={() => setShowCannotAttend(false)}
        bookingId={booking.booking_id}
        onSuccess={load}
      />

      {canComplete && (
        <div className="glass-card p-5 space-y-3">
          <div>
            <h2 className="font-brand text-base font-bold text-primary">
              Complete with customer OTP
            </h2>
            <p className="text-xs text-muted mt-1">
              Ask the customer for the 6-digit code shown in their app, then
              enter it below.
            </p>
          </div>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtpError(null)
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
            }}
            placeholder="••••••"
            aria-label="Completion OTP"
            aria-invalid={!!otpError}
            className={`input-base w-full text-center font-brand text-2xl tracking-widest py-3 ${
              otpError ? 'field-invalid' : ''
            }`}
          />
          {otpError && <p className="text-xs text-error">{otpError}</p>}
          <button
            type="button"
            onClick={handleComplete}
            disabled={busy !== null || otp.length !== 6}
            className="btn-base btn-primary w-full py-3 text-sm font-semibold min-h-[48px] disabled:opacity-60"
          >
            {busy === 'complete' ? 'Completing…' : 'Complete Job'}
          </button>
        </div>
      )}

      {isDone && (
        <div className="glass-card p-5 text-center border-l-4 border-success">
          <p className="text-sm font-semibold text-primary">Job completed</p>
          {booking.completed_at && (
            <p className="text-xs text-muted mt-1">
              {new Date(booking.completed_at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div className="glass-card p-5">
        <h2 className="font-brand text-base font-bold text-primary mb-4">
          Activity
        </h2>
        <StatusTimeline events={events} />
      </div>
    </div>
  )
}

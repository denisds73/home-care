import { memo } from 'react'
import { Link } from 'react-router-dom'
import { TechnicianContactButtons } from '../common/TechnicianContactButtons'
import type { Booking, Technician } from '../../types/domain'

interface DispatchSectionProps {
  booking: Booking
  eligibleTechnicians: Technician[]
  assignedTechnician: Technician | null
  selectedTech: string
  onSelectTech: (id: string) => void
  onDispatch: () => void
  busy: string | null
  dispatchLocked: boolean
  noSkillMatch: boolean
}

export const DispatchSection = memo(function DispatchSection({
  booking,
  eligibleTechnicians,
  assignedTechnician,
  selectedTech,
  onSelectTech,
  onDispatch,
  busy,
  dispatchLocked,
  noSkillMatch,
}: DispatchSectionProps) {
  return (
    <div id="dispatch-section" className="glass-card no-hover p-5 md:p-6 slide-up" style={{ animationDelay: '100ms' }}>
      <h2 className="font-brand text-sm font-bold text-primary uppercase tracking-wide mb-1">
        Dispatch Technician
      </h2>
      <p className="text-xs text-muted mb-4">
        {dispatchLocked
          ? 'Locked — job is already in progress.'
          : 'Pick a technician to send to the customer.'}
      </p>

      {assignedTechnician ? (
        <div className="flex items-center justify-between gap-3 flex-wrap rounded-lg bg-surface px-4 py-3">
          <div>
            <p className="text-sm text-primary font-medium">{assignedTechnician.full_name}</p>
            <p className="text-xs text-muted">{assignedTechnician.phone}</p>
          </div>
          <div className="flex items-center gap-2">
            <TechnicianContactButtons
              phone={assignedTechnician.phone}
              technicianName={assignedTechnician.full_name}
              serviceName={booking.service_name}
              bookingId={booking.booking_id}
            />
            {dispatchLocked && <span className="badge badge-warning">Locked</span>}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted mb-3">No technician assigned yet.</p>
      )}

      {!dispatchLocked && (
        <div className="mt-4 space-y-2">
          {eligibleTechnicians.length === 0 ? (
            <p className="text-xs text-muted">
              No active technicians.{' '}
              <Link to="/vendor/technicians/new" className="text-brand font-semibold">Add one →</Link>
            </p>
          ) : (
            <>
              {noSkillMatch && (
                <p className="text-[11px] text-muted">
                  No exact skill match — showing all active technicians.
                </p>
              )}
              <div className="flex gap-2 flex-wrap">
                <select
                  value={selectedTech}
                  onChange={(e) => onSelectTech(e.target.value)}
                  aria-label="Select technician"
                  className="input-base flex-1 min-w-[180px] px-3 py-2 text-sm"
                >
                  <option value="">
                    {assignedTechnician ? 'Change to…' : 'Select technician…'}
                  </option>
                  {eligibleTechnicians.map((t) => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={onDispatch}
                  disabled={busy !== null || !selectedTech || selectedTech === booking.technician_id}
                  className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] disabled:opacity-60"
                >
                  {busy === 'dispatch' ? 'Dispatching…' : 'Dispatch'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
})

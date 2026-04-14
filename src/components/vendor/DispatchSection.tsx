import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TechnicianContactButtons } from '../common/TechnicianContactButtons'
import Dropdown from '../common/Dropdown'
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
  const techOptions = useMemo(
    () => [
      {
        value: '',
        label: assignedTechnician ? 'Change to…' : 'Select technician…',
      },
      ...eligibleTechnicians.map((t) => ({
        value: t.id,
        label: t.full_name,
      })),
    ],
    [assignedTechnician, eligibleTechnicians],
  )

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
                <Dropdown
                  id={`dispatch-tech-${booking.booking_id}`}
                  options={techOptions}
                  value={selectedTech}
                  onChange={onSelectTech}
                  placeholder={
                    assignedTechnician ? 'Change to…' : 'Select technician…'
                  }
                  className="flex-1 min-w-[180px]"
                />
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

import { useState } from 'react'
import useStore from '../../store/useStore'
import type { TimeSlot } from '../../types/domain'

const TIME_SLOTS: TimeSlot[] = ['9AM-12PM', '12PM-3PM', '3PM-6PM']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function SchedulePage() {
  const showToast = useStore(s => s.showToast)
  const [availability, setAvailability] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    DAYS.forEach(day => {
      TIME_SLOTS.forEach(slot => {
        initial[`${day}-${slot}`] = day !== 'Sun'
      })
    })
    return initial
  })

  const toggleSlot = (key: string) => {
    setAvailability(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    showToast('Schedule updated', 'success')
  }

  return (
    <div>
      <div className="glass-card p-5 mb-6">
        <h2 className="text-sm font-semibold text-primary mb-4">Weekly Availability</h2>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-xs text-muted font-medium pb-3 pr-4">Day</th>
                {TIME_SLOTS.map(slot => (
                  <th key={slot} className="text-center text-xs text-muted font-medium pb-3 px-2">
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map(day => (
                <tr key={day} className="border-t border-gray-50">
                  <td className="py-3 pr-4 text-sm font-medium text-primary">{day}</td>
                  {TIME_SLOTS.map(slot => {
                    const key = `${day}-${slot}`
                    return (
                      <td key={slot} className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSlot(key)}
                          className={`w-full py-2 rounded-lg text-xs font-semibold transition min-h-[40px] ${
                            availability[key] ? 'bg-brand-soft text-brand' : 'bg-muted text-muted'
                          }`}
                        >
                          {availability[key] ? 'Available' : 'Off'}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {DAYS.map(day => (
            <div key={day}>
              <p className="text-sm font-medium text-primary mb-2">{day}</p>
              <div className="flex gap-2 flex-wrap">
                {TIME_SLOTS.map(slot => {
                  const key = `${day}-${slot}`
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(key)}
                      className={`flex-1 min-w-[88px] py-2 rounded-lg text-xs font-semibold transition whitespace-pre-line text-center ${
                        availability[key] ? 'bg-brand-soft text-brand' : 'bg-muted text-muted'
                      }`}
                    >
                      {slot.replace('-', '\n')}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={handleSave} className="btn-base btn-primary text-sm mt-6 px-5 py-2 min-h-[44px]">
          Save Schedule
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import useStore from '../../store/useStore'

export default function SettingsPage() {
  const showToast = useStore(s => s.showToast)
  const [commission, setCommission] = useState(20)
  const [gst, setGst] = useState(18)
  const [convenienceFee, setConvenienceFee] = useState(49)
  const [autoAssign, setAutoAssign] = useState(true)
  const [notifications, setNotifications] = useState(true)

  const handleSave = () => {
    showToast('Settings saved', 'success')
  }

  return (
    <div className="fade-in space-y-6 max-w-2xl">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">Settings</h1>
        <p className="text-muted text-sm mt-1">Configure platform rates and preferences.</p>
      </div>

      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">Commission & Fees</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="commission-range" className="text-xs font-semibold text-secondary block mb-1">
              Platform Commission (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="commission-range"
                type="range"
                min={5}
                max={40}
                value={commission}
                onChange={e => setCommission(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-bold text-primary w-10 text-right">{commission}%</span>
            </div>
          </div>
          <div>
            <label htmlFor="gst-rate" className="text-xs font-semibold text-secondary block mb-1">
              GST Rate (%)
            </label>
            <input
              id="gst-rate"
              type="number"
              className="input-base py-2 px-4 text-sm w-32"
              value={gst}
              onChange={e => setGst(Number(e.target.value))}
            />
          </div>
          <div>
            <label htmlFor="conv-fee" className="text-xs font-semibold text-secondary block mb-1">
              Convenience Fee (₹)
            </label>
            <input
              id="conv-fee"
              type="number"
              className="input-base py-2 px-4 text-sm w-32"
              value={convenienceFee}
              onChange={e => setConvenienceFee(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-primary mb-4">Platform Settings</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Auto-assign Partners</p>
              <p className="text-xs text-muted">Automatically assign nearest available partner to new bookings</p>
            </div>
            <button
              type="button"
              className={`toggle-track${autoAssign ? ' on' : ''}`}
              onClick={() => setAutoAssign(!autoAssign)}
              aria-label="Toggle auto-assign"
            >
              <div className="toggle-thumb" />
            </button>
          </label>
          <label className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Push Notifications</p>
              <p className="text-xs text-muted">Send push notifications for booking updates</p>
            </div>
            <button
              type="button"
              className={`toggle-track${notifications ? ' on' : ''}`}
              onClick={() => setNotifications(!notifications)}
              aria-label="Toggle notifications"
            >
              <div className="toggle-thumb" />
            </button>
          </label>
        </div>
      </div>

      <button type="button" onClick={handleSave} className="btn-base btn-primary text-sm px-6 py-2.5 min-h-[44px]">
        Save Settings
      </button>
    </div>
  )
}

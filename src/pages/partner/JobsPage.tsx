import { memo, useState, useMemo } from 'react'
import { mockJobs } from '../../data/mockData'
import useStore from '../../store/useStore'
import type { Job, JobStatus } from '../../types/domain'

type Tab = 'new' | 'active' | 'completed'

const TAB_STATUSES: Record<Tab, JobStatus[]> = {
  new: ['new'],
  active: ['accepted', 'in_progress'],
  completed: ['completed', 'declined'],
}

function formatCurrency(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN')
}

function StatusBadge({ status }: { status: JobStatus }) {
  const map: Record<JobStatus, { label: string; cls: string }> = {
    new: { label: 'New Request', cls: 'badge badge-pay-pending' },
    accepted: { label: 'Accepted', cls: 'badge badge-confirmed' },
    in_progress: { label: 'In Progress', cls: 'badge badge-in-progress' },
    completed: { label: 'Completed', cls: 'badge badge-completed' },
    declined: { label: 'Declined', cls: 'badge badge-cancelled' },
  }
  const { label, cls } = map[status]
  return <span className={cls}>{label}</span>
}

interface JobCardProps {
  job: Job
  onUpdateStatus: (id: string, status: JobStatus) => void
}

const JobCard = memo(({ job, onUpdateStatus }: JobCardProps) => {
  return (
    <div className="glass-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-primary text-sm">{job.serviceName}</p>
          <p className="text-xs text-muted mt-0.5">#{job.bookingId}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={job.status} />
          <span className="font-bold text-brand text-sm">
            {formatCurrency(job.price)}
          </span>
        </div>
      </div>

      {/* Customer info */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-surface rounded-lg p-2.5">
          <p className="text-muted">Customer</p>
          <p className="font-medium text-primary mt-0.5">{job.customerName}</p>
        </div>
        <div className="bg-surface rounded-lg p-2.5">
          <p className="text-muted">Phone</p>
          <p className="font-medium text-primary mt-0.5">{job.phone}</p>
        </div>
        <div className="bg-surface rounded-lg p-2.5">
          <p className="text-muted">Date &amp; Time</p>
          <p className="font-medium text-primary mt-0.5">
            {job.preferredDate} · {job.timeSlot}
          </p>
        </div>
        <div className="bg-surface rounded-lg p-2.5">
          <p className="text-muted">Category</p>
          <p className="font-medium text-primary mt-0.5 capitalize">
            {job.category.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Address */}
      <div className="bg-surface rounded-lg p-2.5 text-xs">
        <p className="text-muted">Address</p>
        <p className="font-medium text-primary mt-0.5">{job.address}</p>
      </div>

      {/* Actions */}
      {job.status === 'new' && (
        <div className="flex gap-2 pt-1">
          <button
            className="btn-base btn-success flex-1 py-2 text-sm"
            onClick={() => onUpdateStatus(job.id, 'accepted')}
          >
            Accept
          </button>
          <button
            className="btn-base btn-danger flex-1 py-2 text-sm"
            onClick={() => onUpdateStatus(job.id, 'declined')}
          >
            Decline
          </button>
        </div>
      )}
      {job.status === 'accepted' && (
        <button
          className="btn-base btn-primary w-full py-2 text-sm"
          onClick={() => onUpdateStatus(job.id, 'in_progress')}
        >
          Start Service
        </button>
      )}
      {job.status === 'in_progress' && (
        <button
          className="btn-base btn-success w-full py-2 text-sm"
          onClick={() => onUpdateStatus(job.id, 'completed')}
        >
          Mark Complete
        </button>
      )}
    </div>
  )
})

JobCard.displayName = 'JobCard'

export default function JobsPage() {
  const showToast = useStore((s) => s.showToast)
  const [activeTab, setActiveTab] = useState<Tab>('new')
  const [jobs, setJobs] = useState<Job[]>(mockJobs)

  const updateJobStatus = (id: string, status: JobStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status } : j)),
    )
    const labels: Record<JobStatus, string> = {
      accepted: 'Job accepted successfully',
      declined: 'Job declined',
      in_progress: 'Service started',
      completed: 'Job marked as complete',
      new: 'Job updated',
    }
    showToast(labels[status], status === 'declined' ? 'danger' : 'success')
  }

  const tabCounts = useMemo(
    () => ({
      new: jobs.filter((j) => TAB_STATUSES.new.includes(j.status)).length,
      active: jobs.filter((j) => TAB_STATUSES.active.includes(j.status)).length,
      completed: jobs.filter((j) => TAB_STATUSES.completed.includes(j.status))
        .length,
    }),
    [jobs],
  )

  const filteredJobs = useMemo(
    () => jobs.filter((j) => TAB_STATUSES[activeTab].includes(j.status)),
    [jobs, activeTab],
  )

  const tabs: { key: Tab; label: string }[] = [
    { key: 'new', label: `New Requests` },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ]

  return (
    <div className="fade-in space-y-5">
      <div>
        <h1 className="font-brand text-xl md:text-2xl font-bold text-primary">
          My Jobs
        </h1>
        <p className="text-muted text-sm mt-1">
          Manage your service requests and active jobs.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-full">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
              activeTab === key
                ? 'bg-card text-brand shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            {label}
            {tabCounts[key] > 0 && (
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                  activeTab === key
                    ? 'bg-brand-soft text-brand'
                    : 'bg-border text-secondary'
                }`}
              >
                {tabCounts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Job cards */}
      {filteredJobs.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-muted text-sm">No jobs in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} onUpdateStatus={updateJobStatus} />
          ))}
        </div>
      )}
    </div>
  )
}

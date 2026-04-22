import { memo, useState, useEffect, useMemo, useCallback } from 'react'
import { partnerService } from '../../services/partnerService'
import useStore from '../../store/useStore'
import type { Job, JobStatus } from '../../types/domain'
import { ListEmptyState } from '../../components/common/ListEmptyState'
import { BriefcaseIcon } from '../../components/common/Icons'

type Tab = 'new' | 'active' | 'completed'

const TAB_STATUSES: Record<Tab, JobStatus[]> = {
  new: ['new'],
  active: ['accepted', 'in_progress'],
  completed: ['completed', 'declined'],
}

function formatCurrency(amount: number): string {
  return '\u20B9' + amount.toLocaleString('en-IN')
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
  isUpdating: boolean
}

const JobCard = memo(({ job, onUpdateStatus, isUpdating }: JobCardProps) => {
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
          <p className="text-muted">Date</p>
          <p className="font-medium text-primary mt-0.5">
            {job.preferredDate}
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
            disabled={isUpdating}
          >
            Accept
          </button>
          <button
            className="btn-base btn-danger flex-1 py-2 text-sm"
            onClick={() => onUpdateStatus(job.id, 'declined')}
            disabled={isUpdating}
          >
            Decline
          </button>
        </div>
      )}
      {job.status === 'accepted' && (
        <button
          className="btn-base btn-primary w-full py-2 text-sm"
          onClick={() => onUpdateStatus(job.id, 'in_progress')}
          disabled={isUpdating}
        >
          Start Service
        </button>
      )}
      {job.status === 'in_progress' && (
        <button
          className="btn-base btn-success w-full py-2 text-sm"
          onClick={() => onUpdateStatus(job.id, 'completed')}
          disabled={isUpdating}
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
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchJobs = useCallback(async () => {
    try {
      const res = await partnerService.getJobs()
      setJobs(res.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const updateJobStatus = useCallback(
    async (id: string, status: JobStatus) => {
      setUpdatingId(id)
      try {
        await partnerService.updateJobStatus(id, status)
        // Optimistically update local state
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
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update job'
        showToast(message, 'danger')
      } finally {
        setUpdatingId(null)
      }
    },
    [showToast],
  )

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

  const emptyForTab = {
    new: {
      title: 'No new requests',
      description: 'Incoming job requests will appear here for you to accept or decline.',
    },
    active: {
      title: 'No active jobs',
      description: 'Accepted and in-progress work shows here while you are on site.',
    },
    completed: {
      title: 'Nothing in this tab yet',
      description: 'Completed and declined jobs will appear under Completed.',
    },
  } as const

  const tabs: { key: Tab; label: string }[] = [
    { key: 'new', label: 'New Requests' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
  ]

  if (error && jobs.length === 0) {
    return (
      <div className="fade-in flex flex-col items-center justify-center py-20">
        <p className="text-error text-sm mb-4">{error}</p>
        <button
          className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]"
          onClick={() => {
            setIsLoading(true)
            fetchJobs()
          }}
        >
          Retry
        </button>
      </div>
    )
  }

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
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-3 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-5 w-20 bg-muted rounded" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-14 bg-muted rounded-lg" />
                <div className="h-14 bg-muted rounded-lg" />
              </div>
              <div className="h-10 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <ListEmptyState
          icon={<BriefcaseIcon className="w-12 h-12" />}
          title={emptyForTab[activeTab].title}
          description={emptyForTab[activeTab].description}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onUpdateStatus={updateJobStatus}
              isUpdating={updatingId === job.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

import { memo } from 'react'

export const ProfileSkeleton = memo(() => (
  <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
    <div className="glass-card p-6 md:p-10 animate-pulse">
      <div className="flex items-center gap-4 md:gap-6">
        <div className="w-24 h-24 md:w-[120px] md:h-[120px] rounded-full bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
          <div className="h-4 w-40 bg-muted rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 md:gap-4 mt-6">
        <div className="h-16 rounded-2xl bg-muted" />
        <div className="h-16 rounded-2xl bg-muted" />
        <div className="h-16 rounded-2xl bg-muted" />
      </div>
    </div>
    <div className="glass-card p-5 md:p-6 animate-pulse space-y-4">
      <div className="h-5 w-48 bg-muted rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  </div>
))

ProfileSkeleton.displayName = 'ProfileSkeleton'

/** Shared Tailwind classes for admin table/card row icon actions (Catalog, Vendors, Offers, etc.) */
const focus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

export const adminIconBtnBase = `inline-flex items-center justify-center rounded-lg p-2 min-h-[44px] min-w-[44px] transition-colors ${focus}`

export const adminRowIconAction = {
  view: `${adminIconBtnBase} text-secondary hover:bg-surface hover:text-primary focus-visible:ring-brand/35`,
  edit: `${adminIconBtnBase} text-brand hover:bg-brand-soft/60 focus-visible:ring-brand/40`,
  delete: `${adminIconBtnBase} text-red-600 hover:bg-red-50 focus-visible:ring-red-400/45`,
  /** Disable / suspend / take offline */
  restrict: `${adminIconBtnBase} text-amber-700 hover:bg-amber-50 focus-visible:ring-amber-400/45`,
  /** Enable / activate / approve / reactivate */
  allow: `${adminIconBtnBase} text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500/40`,
  reject: `${adminIconBtnBase} text-red-600 hover:bg-red-50 focus-visible:ring-red-400/45`,
} as const

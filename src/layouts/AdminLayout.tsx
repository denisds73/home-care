import { Outlet } from 'react-router-dom'
import Toast from '../components/common/Toast'
import ScrollToTop from '../components/common/ScrollToTop'

/**
 * Admin layout — separate chrome from the customer-facing layout.
 * AdminPanel already has its own tabs/header, so this is minimal.
 */
export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <ScrollToTop />
      <Outlet />
      <Toast />
    </div>
  )
}

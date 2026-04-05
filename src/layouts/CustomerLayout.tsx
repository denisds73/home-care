import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import MobileNav from '../components/layout/MobileNav'
import CartDrawer from '../components/cart/CartDrawer'
import CartBar from '../components/cart/CartBar'
import DetailSheet from '../components/services/DetailSheet'
import AccountSheet from '../components/layout/AccountSheet'
import Toast from '../components/common/Toast'
import ScrollToTop from '../components/common/ScrollToTop'

/**
 * Customer-facing layout.
 * Wraps all public/account routes with navbar, footer, cart drawer, etc.
 */
export default function CustomerLayout() {
  return (
    <div className="pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:pb-0">
      <ScrollToTop />
      <a
        href="#mainContent"
        className="absolute left-[-9999px] top-0 z-[999] bg-[#111827] text-white px-4 py-2 text-sm rounded-br-lg focus:left-0"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="mainContent">
        <Outlet />
      </main>
      <MobileNav />
      <CartDrawer />
      <CartBar />
      <DetailSheet />
      <AccountSheet />
      <Toast />
    </div>
  )
}

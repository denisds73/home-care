import useStore from './store/useStore'
import Navbar from './components/layout/Navbar'
import MobileNav from './components/layout/MobileNav'
import Footer from './components/layout/Footer'
import Hero from './components/home/Hero'
import CategoryGrid from './components/home/CategoryGrid'
import HowItWorks from './components/home/HowItWorks'
import TrustStrip from './components/home/TrustStrip'
import OffersCarousel from './components/home/OffersCarousel'
import PopularServices from './components/home/PopularServices'
import WhyChooseUs from './components/home/WhyChooseUs'
import CTABanner from './components/home/CTABanner'
import Testimonials from './components/home/Testimonials'
import ServiceListing from './components/services/ServiceListing'
import DetailSheet from './components/services/DetailSheet'
import CartDrawer from './components/cart/CartDrawer'
import CartBar from './components/cart/CartBar'
import BookingFlow from './components/booking/BookingFlow'
import AdminPanel from './components/admin/AdminPanel'
import AdminAuth from './components/admin/AdminAuth'
import Toast from './components/common/Toast'
import AccountSheet from './components/layout/AccountSheet'

function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <HowItWorks />
      <TrustStrip />
      <OffersCarousel />
      <PopularServices />
      <WhyChooseUs />
      <CTABanner />
      <Testimonials />
      <Footer />
    </>
  )
}

export default function App() {
  const { currentView } = useStore()

  return (
    <div className="pb-16 sm:pb-0">
      <a href="#mainContent" className="absolute left-[-9999px] top-0 z-[999] bg-[#111827] text-white px-4 py-2 text-sm rounded-br-lg focus:left-0">Skip to main content</a>
      <Navbar />
      <main id="mainContent">
        {currentView === 'home' && <HomePage />}
        {currentView === 'services' && <ServiceListing />}
        {currentView === 'booking' && <BookingFlow />}
        {currentView === 'admin' && <AdminPanel />}
      </main>
      <MobileNav />
      <CartDrawer />
      <CartBar />
      <DetailSheet />
      <AdminAuth />
      <AccountSheet />
      <Toast />
    </div>
  )
}

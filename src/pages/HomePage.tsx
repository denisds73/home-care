import DelayAlertBanner from '../components/home/DelayAlertBanner'
import Hero from '../components/home/Hero'
import CategoryGrid from '../components/home/CategoryGrid'
import HowItWorks from '../components/home/HowItWorks'
import TrustStrip from '../components/home/TrustStrip'
import OffersCarousel from '../components/home/OffersCarousel'
import PopularServices from '../components/home/PopularServices'
import WhyChooseUs from '../components/home/WhyChooseUs'
import CTABanner from '../components/home/CTABanner'
import Testimonials from '../components/home/Testimonials'
import Footer from '../components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <DelayAlertBanner />
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

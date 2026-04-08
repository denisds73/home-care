import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import useStore from '../../store/useStore'
import { userService } from '../../services/userService'
import { ProfileHero } from '../../components/profile/ProfileHero'
import { ProfileTabs, type TabId } from '../../components/profile/ProfileTabs'
import { PersonalInfoSection } from '../../components/profile/PersonalInfoSection'
import { AddressesSection } from '../../components/profile/AddressesSection'
import { PaymentMethodsSection } from '../../components/profile/PaymentMethodsSection'
import { PreferencesSection } from '../../components/profile/PreferencesSection'
import { SecuritySection } from '../../components/profile/SecuritySection'
import { ProfileSkeleton } from '../../components/profile/ProfileSkeleton'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const restoreSession = useAuthStore((s) => s.restoreSession)
  const updateUser = useAuthStore((s) => s.updateUser)
  const bookings = useStore((s) => s.bookings)

  const [activeTab, setActiveTab] = useState<TabId>('personal')
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (!user) {
      void restoreSession()
    }
  }, [user, restoreSession])

  useEffect(() => {
    if (!user || hydratedRef.current) return
    hydratedRef.current = true
    ;(async () => {
      const [addressesResult, paymentsResult] = await Promise.allSettled([
        userService.listAddresses(),
        userService.listPaymentMethods(),
      ])
      const patch: Parameters<typeof updateUser>[0] = {}
      if (addressesResult.status === 'fulfilled') {
        patch.addresses = addressesResult.value
      }
      if (paymentsResult.status === 'fulfilled') {
        patch.paymentMethods = paymentsResult.value
      }
      if (Object.keys(patch).length > 0) {
        updateUser(patch)
      }
    })()
  }, [user, updateUser])

  const handleEditClick = () => {
    setActiveTab('personal')
    if (typeof document !== 'undefined') {
      setTimeout(() => {
        document
          .getElementById('personal-info-heading')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-surface pb-16">
        <ProfileSkeleton />
        {isLoading && <span className="sr-only">Loading profile…</span>}
      </main>
    )
  }

  const bookingsCount = bookings.filter(
    (b) => b.customer_name === user.name || b.phone === user.phone,
  ).length
  const addressesCount = user.addresses?.length ?? 0

  return (
    <main className="min-h-screen bg-surface pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6 md:pt-10">
        <div style={{ animationDelay: '0ms' }} className="slide-up">
          <ProfileHero
            user={user}
            bookingsCount={bookingsCount}
            addressesCount={addressesCount}
            onEdit={handleEditClick}
          />
        </div>
      </div>

      <div className="mt-6">
        <ProfileTabs active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-6">
        <div hidden={activeTab !== 'personal'}>
          <PersonalInfoSection user={user} />
        </div>
        <div hidden={activeTab !== 'addresses'}>
          <AddressesSection user={user} />
        </div>
        <div hidden={activeTab !== 'payments'}>
          <PaymentMethodsSection user={user} />
        </div>
        <div hidden={activeTab !== 'preferences'}>
          <PreferencesSection user={user} />
        </div>
        <div hidden={activeTab !== 'security'}>
          <SecuritySection />
        </div>
      </div>
    </main>
  )
}

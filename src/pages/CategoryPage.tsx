import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import useStore from '../store/useStore'
import { CATEGORIES, STORYSET_IMGS } from '../data/categories'
import ServiceCard from '../components/services/ServiceCard'
import type { CategoryId } from '../types/domain'

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()
  const services = useStore(s => s.services)
  const servicesLoading = useStore(s => s.servicesLoading)
  const servicesError = useStore(s => s.servicesError)
  const fetchServices = useStore(s => s.fetchServices)

  const cat = CATEGORIES.find(c => c.id === categoryId)

  useEffect(() => {
    if (categoryId) {
      useStore.setState({ selectedCategory: categoryId as CategoryId })
      fetchServices()
    }
  }, [categoryId, fetchServices])

  if (!cat || !categoryId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center fade-in">
        <h2 className="text-xl font-bold text-primary mb-2">Category Not Found</h2>
        <p className="text-secondary text-sm mb-6">The category you're looking for doesn't exist.</p>
        <button
          type="button"
          onClick={() => navigate('/app')}
          className="btn-base btn-primary px-6 py-2.5 text-sm"
        >
          Browse All Categories
        </button>
      </div>
    )
  }

  const list = services
    .filter(s => s.category === categoryId && s.is_active)
    .sort((a, b) => (b.is_basic ? 1 : 0) - (a.is_basic ? 1 : 0))

  return (
    <div className="fade-in">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 pb-[100px]">
        <button
          type="button"
          onClick={() => navigate('/app')}
          className="btn-base btn-secondary inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium mb-5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Categories
        </button>

        <div className="rounded-2xl overflow-hidden mb-8" style={{ background: cat.color + '10' }}>
          <div className="flex items-center p-5 sm:p-8 gap-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-3xl font-extrabold text-primary">{cat.name} Services</h2>
              <p className="text-sm text-secondary mt-1">{cat.desc}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-muted text-brand">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  30-Day Warranty
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Same Day Service
                </span>
              </div>
            </div>
            <img
              src={STORYSET_IMGS[categoryId as CategoryId]}
              alt={cat.name}
              className="w-20 h-20 sm:w-40 sm:h-40 object-contain shrink-0"
            />
          </div>
        </div>

        {servicesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-8 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : servicesError ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto mb-3 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-error font-semibold mb-1">Failed to load services</p>
            <p className="text-secondary text-sm mb-4">{servicesError}</p>
            <button
              type="button"
              onClick={() => fetchServices()}
              className="btn-base btn-primary px-6 py-2.5 text-sm"
            >
              Try Again
            </button>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto mb-3 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-muted font-medium">No active services in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {list.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        )}
      </div>
    </div>
  )
}

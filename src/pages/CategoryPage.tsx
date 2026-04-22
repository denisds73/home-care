import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import useStore from '../store/useStore'
import { CATEGORIES } from '../data/categories'
import ServiceCard from '../components/services/ServiceCard'
import { ListEmptyState } from '../components/common/ListEmptyState'
import { GridIcon } from '../components/common/Icons'
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

        <h2 className="text-xl sm:text-2xl font-extrabold text-primary mb-6">{cat.name} Services</h2>

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
          <ListEmptyState
            icon={<GridIcon className="w-12 h-12" />}
            title="No active services here"
            description={`We don't have live ${cat.name.toLowerCase()} services listed right now.`}
            action={
              <Link to="/app" className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px] inline-flex">
                Browse other categories
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {list.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        )}
      </div>
    </div>
  )
}

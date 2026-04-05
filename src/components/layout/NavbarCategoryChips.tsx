import { Link, useLocation } from 'react-router-dom'
import { CATEGORIES, CATEGORY_ICONS } from '../../data/categories'
import useStore from '../../store/useStore'

export function NavbarCategoryChips() {
  const location = useLocation()
  const selectedCategory = useStore(s => s.selectedCategory)

  const isHome =
    location.pathname === '/app' || location.pathname === '/app/'
  const currentCategoryPath = location.pathname.startsWith('/app/services/')
    ? location.pathname.split('/')[3]
    : null

  return (
    <div
      className="hidden sm:block overflow-x-auto relative nav-category-scroll"
      style={{ scrollbarWidth: 'none' }}
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 flex"
        role="tablist"
        aria-label="Service categories"
      >
        <Link
          to="/app"
          role="tab"
          aria-selected={isHome}
          aria-current={isHome ? 'page' : undefined}
          className={`group flex items-center gap-2 px-4 py-3 text-[.8rem] font-medium tracking-[.01em] whitespace-nowrap border-b-[2.5px] transition-colors duration-150 ${
            isHome
              ? 'text-brand border-brand'
              : 'text-secondary border-transparent hover:text-primary'
          }`}
        >
          <svg
            className="w-[20px] h-[20px] lg:w-[22px] lg:h-[22px] transition-transform duration-150 group-hover:scale-[1.08]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
            />
          </svg>
          All
        </Link>
        {CATEGORIES.map(cat => {
          const isActive =
            currentCategoryPath === cat.id ||
            (selectedCategory === cat.id && !!currentCategoryPath)
          const IconComponent = CATEGORY_ICONS[cat.id]
          return (
            <Link
              key={cat.id}
              to={`/app/services/${cat.id}`}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? 'page' : undefined}
              className={`group flex items-center gap-2 px-4 py-3 text-[.8rem] font-medium tracking-[.01em] whitespace-nowrap border-b-[2.5px] transition-colors duration-150 ${
                isActive
                  ? 'text-brand border-brand'
                  : 'text-secondary border-transparent hover:text-primary'
              }`}
            >
              <IconComponent
                className="w-[20px] h-[20px] lg:w-[22px] lg:h-[22px] transition-transform duration-150 group-hover:scale-[1.08]"
                aria-hidden="true"
              />
              {cat.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

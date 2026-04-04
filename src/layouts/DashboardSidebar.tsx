import { memo } from 'react'
import { NavLink } from 'react-router-dom'

export interface NavItem {
  icon: React.ReactNode
  label: string
  to: string
}

export interface NavGroup {
  section?: string
  items: NavItem[]
}

interface DashboardSidebarProps {
  groups: NavGroup[]
  logo: React.ReactNode
  bottomItems?: NavItem[]
  mobileOpen: boolean
  onMobileClose: () => void
}

export const DashboardSidebar = memo(
  ({ groups, logo, bottomItems, mobileOpen, onMobileClose }: DashboardSidebarProps) => {
    const navContent = (
      <>
        <div className="sidebar-logo">{logo}</div>
        <nav className="sidebar-nav">
          {groups.map((group, gi) => (
            <div key={gi}>
              {group.section && (
                <div className="sidebar-section">{group.section}</div>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to.split('/').length <= 2}
                  className={({ isActive }) =>
                    `sidebar-item${isActive ? ' active' : ''}`
                  }
                  onClick={onMobileClose}
                >
                  {item.icon}
                  <span className="sidebar-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        {bottomItems && bottomItems.length > 0 && (
          <div className="sidebar-bottom">
            {bottomItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `sidebar-item${isActive ? ' active' : ''}`
                }
                onClick={onMobileClose}
              >
                {item.icon}
                <span className="sidebar-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </>
    )

    return (
      <>
        {/* Desktop sidebar */}
        <aside className="sidebar">{navContent}</aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="sidebar-backdrop" onClick={onMobileClose} />
        )}
        <aside className={`sidebar-mobile${mobileOpen ? ' open' : ''}`}>
          {navContent}
        </aside>
      </>
    )
  },
)

DashboardSidebar.displayName = 'DashboardSidebar'

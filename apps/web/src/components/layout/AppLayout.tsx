import { NavLink, Outlet } from 'react-router-dom'
import { sidebarRoutes } from '../../constants/dashboard'
import { useDashboard } from '../../context/DashboardContext'

export function AppLayout() {
  const { toast } = useDashboard()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__mark">◔</div>
          <div>
            <p>Finless</p>
            <span>Personal finance</span>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Primary navigation">
          {sidebarRoutes.map((item) => (
            <NavLink
              key={item.path}
              className={({ isActive }) => `sidebar__item ${isActive ? 'is-active' : ''}`}
              to={item.path}
            >
              <span className="sidebar__bullet" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <section className="sidebar__card">
          <p>Help center</p>
          <strong>24/7</strong>
          <span>Talk to support about unusual spending patterns.</span>
          <div className="progress">
            <span style={{ width: '68%' }} />
          </div>
        </section>
      </aside>

      <main className="dashboard">
        <Outlet />
      </main>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  )
}

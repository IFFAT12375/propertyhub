import { NavLink } from 'react-router-dom'

export default function DashboardLayout({
  title,
  description,
  navigation,
  children,
}) {
  return (
    <div className="dashboard page-container">
      <aside className="dashboard__sidebar">
        <span className="eyebrow">Workspace</span>
        <nav aria-label={`${title} navigation`}>
          {navigation.map(({ to, label, icon: Icon, end = false }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `dashboard__nav-link${isActive ? ' dashboard__nav-link--active' : ''}`
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="dashboard__main">
        <header className="dashboard__header">
          <div>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
        </header>
        <div className="dashboard__content">{children}</div>
      </div>
    </div>
  )
}

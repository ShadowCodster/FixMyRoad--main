import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-civic-50 text-civic-800'
      : 'text-slate-600 hover:bg-slate-100 hover:text-civic-800'
  }`

export default function Navbar() {
  const { user, logout, isAuthority, loading } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur">
      {/* Civic accent stripe — signature element */}
      <div className="h-[3px] bg-gradient-to-r from-civic-700 via-accent-500 to-civic-700" />

      <div className="border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            {/* Seal-style mark */}
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-civic-700 bg-civic-700 text-base font-serif font-semibold text-white">
              R
              <span className="absolute inset-0 rounded-full border border-civic-300/40" />
            </span>
            <div>
              <p className="font-serif text-lg font-semibold leading-tight text-civic-900">
                RoadWatch
              </p>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Bengaluru Road Monitoring
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/map" className={navLinkClass}>
              Map
            </NavLink>
            <NavLink to="/complaint" className={navLinkClass}>
              Report Issue
            </NavLink>
            <NavLink to="/track" className={navLinkClass}>
              Track
            </NavLink>
            <NavLink to="/contractors" className={navLinkClass}>
              Contractors
            </NavLink>
            <NavLink to="/authorities" className={navLinkClass}>
              Authorities
            </NavLink>
            {isAuthority && (
              <NavLink to="/authority" className={navLinkClass}>
                Authority Panel
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {!loading &&
              (user ? (
                <>
                  <span className="hidden text-sm text-slate-600 sm:inline">
                    {user.name}
                    <span className="ml-1 rounded bg-civic-50 px-1.5 py-0.5 text-xs capitalize text-civic-700">
                      {user.role}
                    </span>
                  </span>
                  <button type="button" onClick={logout} className="btn-secondary text-xs">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="btn-secondary text-xs"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="btn-primary text-xs"
                  >
                    Sign up
                  </button>
                </>
              ))}
          </div>
        </div>
      </div>
    </header>
  )
}
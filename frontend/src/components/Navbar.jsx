import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const links = [
  { to: '/',                label: 'Home' },
  { to: '/services',        label: 'Services' },
  { to: '/farm-monitoring', label: 'Farm Monitoring & Security' },
  { to: '/gallery',         label: 'Projects / Gallery' },
  { to: '/about',           label: 'About Us' },
  { to: '/contact',         label: 'Contact Us' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  return (
    <nav className="bg-gf-dark sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gf-pale rounded-full flex items-center justify-center">
              <span className="text-gf-dark font-heading font-bold text-sm">GF</span>
            </div>
            <span className="text-white font-heading font-bold text-lg leading-tight">
              GreenField<br />
              <span className="text-gf-pale text-xs font-normal tracking-wide">FARM CARE</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-body font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-gf-pale bg-gf-mid'
                      : 'text-white hover:text-gf-pale hover:bg-gf-mid/40'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <Link to="/dashboard" className="ml-2 bg-gf-pale text-gf-dark font-heading font-semibold px-4 py-1.5 rounded-lg text-sm hover:bg-white transition-colors">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="ml-2 bg-gf-pale text-gf-dark font-heading font-semibold px-4 py-1.5 rounded-lg text-sm hover:bg-white transition-colors">
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-white p-2 rounded-md hover:bg-gf-mid/50"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-gf-dark border-t border-gf-mid/40 px-4 pb-5">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-3 rounded-md text-sm font-body font-medium mt-1 transition-colors ${
                  isActive ? 'text-gf-pale bg-gf-mid' : 'text-white hover:bg-gf-mid/40'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}

          {/* Auth buttons */}
          <div className="mt-4 pt-4 border-t border-gf-mid/40 flex flex-col gap-2">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="block w-full px-4 py-3 rounded-lg text-sm font-body font-semibold text-center bg-gf-pale text-gf-dark hover:bg-white active:bg-gf-pale/80 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block w-full px-4 py-3 rounded-lg text-sm font-body font-semibold text-center text-white border border-white/30 hover:bg-white/10 active:bg-white/20 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="block w-full px-4 py-3 rounded-lg text-sm font-body font-semibold text-center bg-gf-pale text-gf-dark hover:bg-white active:bg-gf-pale/80 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

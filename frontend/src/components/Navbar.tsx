import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Leaf } from 'lucide-react'

const links = [
  { to: '/',                label: 'Home' },
  { to: '/services',        label: 'Services' },
  { to: '/farm-monitoring', label: 'Farm Monitoring' },
  { to: '/gallery',         label: 'Gallery' },
  { to: '/about',           label: 'About Us' },
  { to: '/contact',         label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gf-dark/95 backdrop-blur-md shadow-lg' : 'bg-gf-dark'}`}>
      <div className="container-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-gf-pale rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-gf-dark" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <p className="text-white font-heading font-bold text-base leading-none">GreenField</p>
              <p className="text-gf-pale text-[10px] font-body tracking-widest uppercase leading-none mt-0.5">Farm Care</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-body font-medium transition-colors duration-150 whitespace-nowrap ${
                    isActive ? 'text-gf-pale bg-gf-mid' : 'text-white/80 hover:text-white hover:bg-gf-mid/40'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <a
              href="https://wa.me/919945100567?text=Hi%2C%20I%20want%20to%20know%20more%20about%20GreenField%20Farm%20Care"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 btn-primary text-sm py-2 px-4"
            >
              Free Site Visit
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-white p-2 rounded-md hover:bg-gf-mid/40 transition-colors"
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-gf-dark border-t border-gf-mid/30 px-4 pb-5 pt-2">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-body font-medium mt-1 transition-colors ${
                  isActive ? 'text-gf-pale bg-gf-mid' : 'text-white/80 hover:bg-gf-mid/40 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <a
            href="https://wa.me/919945100567"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="block mt-3 btn-primary text-center text-sm"
          >
            Request Free Site Visit
          </a>
        </div>
      )}
    </nav>
  )
}

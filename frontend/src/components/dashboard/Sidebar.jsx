import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/dashboard',         label: 'Overview',  icon: '🏠', roles: ['admin', 'field_team', 'customer'] },
  { to: '/dashboard/farms',   label: 'Farms',     icon: '🌾', roles: ['admin', 'field_team', 'customer'] },
  { to: '/dashboard/tasks',   label: 'Tasks',     icon: '✅', roles: ['admin', 'field_team'] },
  { to: '/dashboard/reports', label: 'Reports',   icon: '📋', roles: ['admin', 'field_team', 'customer'] },
]

export default function Sidebar({ open, onClose }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const allowed = navItems.filter(n => n.roles.includes(user?.role))

  return (
    <>
      {/* Overlay (mobile) */}
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gf-dark text-white flex flex-col z-30
        transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gf-mid/40">
          <div className="w-9 h-9 bg-gf-pale rounded-full flex items-center justify-center shrink-0">
            <span className="text-gf-dark font-heading font-bold text-sm">GF</span>
          </div>
          <div>
            <p className="font-heading font-bold text-white leading-tight text-sm">GreenField</p>
            <p className="text-gf-pale text-[10px] tracking-wide font-light">FARM CARE</p>
          </div>
        </div>

        {/* User chip */}
        <div className="px-6 py-4 border-b border-gf-mid/30">
          <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
          <span className="inline-block mt-1 bg-gf-light/30 text-gf-pale text-[10px] font-heading px-2 py-0.5 rounded-full capitalize">
            {user?.role?.replace('_', ' ')}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {allowed.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-colors
                ${isActive ? 'bg-gf-mid text-gf-pale' : 'text-white/80 hover:bg-gf-mid/40 hover:text-white'}`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 pb-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium text-white/60 hover:bg-red-900/30 hover:text-red-300 transition-colors"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

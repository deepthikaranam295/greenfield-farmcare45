import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/dashboard/Sidebar'
import { useAuth } from '../../hooks/useAuth'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 shrink-0">
          <button
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <p className="text-sm text-gray-400 font-body">Welcome back,</p>
            <p className="font-heading font-semibold text-gf-dark text-sm leading-tight">{user?.name}</p>
          </div>
          <a href="/" className="text-xs text-gf-mid hover:underline font-body hidden sm:block">
            ← Back to Website
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

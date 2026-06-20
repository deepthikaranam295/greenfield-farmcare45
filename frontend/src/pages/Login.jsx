import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ROLE_REDIRECT = {
  farm_owner:  '/dashboard',
  farm_worker: '/dashboard',
  customer:    '/dashboard',
  admin:       '/dashboard',
  field_team:  '/dashboard/tasks',
}

export default function Login() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const from       = location.state?.from?.pathname || null

  const [form, setForm]   = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await signIn(form.email, form.password)
      const dest = from || ROLE_REDIRECT[user.role] || '/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a1f13] via-gf-dark to-[#1e5c3a] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gf-light/10 rounded-full" />
        <div className="absolute -bottom-32 -right-16 w-[500px] h-[500px] bg-gf-mid/10 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-gf-pale/5 rounded-full" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gf-pale rounded-full flex items-center justify-center">
              <span className="text-gf-dark font-heading font-bold text-sm">GF</span>
            </div>
            <span className="text-white font-heading font-bold text-lg tracking-wide">GreenField Farm Care</span>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-heading font-bold text-white leading-tight mb-4">
            Smart Farm<br />Management<br />
            <span className="text-gf-pale">Made Simple.</span>
          </h1>
          <p className="text-white/60 font-body text-base leading-relaxed mb-8">
            Connect farm owners, workers, and customers on one unified platform.
            Monitor crops, manage tasks, and grow together.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {['Farm Monitoring', 'Task Management', 'Real-time Reports', 'Team Coordination'].map(f => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gf-pale rounded-full" />
                <span className="text-white/70 text-sm font-body">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/30 text-xs font-body">
          © 2026 GreenField Farm Care
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gf-dark rounded-full flex items-center justify-center">
              <span className="text-white font-heading font-bold text-xs">GF</span>
            </div>
            <span className="text-gf-dark font-heading font-bold text-base">GreenField Farm Care</span>
          </div>

          <h2 className="text-2xl font-heading font-bold text-gf-dark mb-1">Welcome back</h2>
          <p className="text-gray-500 font-body text-sm mb-8">Sign in to your account to continue</p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {error && (
              <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg font-body">
                <span className="mt-0.5">⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-body font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-body font-medium text-gray-700">Password</label>
                  <Link to="/forgot-password" className="text-xs text-gf-mid hover:text-gf-dark font-body hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid focus:border-transparent transition-shadow"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gf-dark text-white font-heading font-semibold py-3 rounded-xl hover:bg-gf-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-md shadow-gf-dark/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          <p className="text-center mt-6 text-sm font-body text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-gf-mid font-semibold hover:underline">Create account</Link>
          </p>

          <p className="text-center mt-3">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600 font-body hover:underline">
              ← Back to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

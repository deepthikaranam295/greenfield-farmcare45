import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gf-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gf-pale rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-gf-dark font-heading font-bold text-xl">GF</span>
          </div>
          <h1 className="text-white font-heading font-bold text-2xl">GreenField Farm Care</h1>
          <p className="text-white/60 text-sm mt-1 font-body">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-body font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gf-mid text-white font-heading font-semibold py-2.5 rounded-lg hover:bg-gf-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Quick fill hints for dev */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-body text-center mb-2">Demo credentials</p>
            <div className="space-y-1">
              {[
                { label: 'Admin', email: 'admin@greenfield.com', pwd: 'Admin@123' },
                { label: 'Field Staff', email: 'ramu@greenfield.com', pwd: 'Field@123' },
                { label: 'Customer', email: 'venkat@example.com', pwd: 'Customer@123' },
              ].map(({ label, email, pwd }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm({ email, password: pwd })}
                  className="w-full text-left px-3 py-1.5 rounded-md hover:bg-gf-pale/50 text-xs font-body text-gray-500 transition-colors"
                >
                  <span className="font-semibold text-gf-mid">{label}</span> — {email}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-white/50 text-xs font-body">
          <Link to="/" className="hover:text-white transition-colors">← Back to website</Link>
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../api/auth'
import { useAuth } from '../hooks/useAuth'

const EMPTY = { name: '', email: '', phone: '', password: '', confirm: '' }

export default function Signup() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [form, setForm]   = useState(EMPTY)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        confirm_password: form.confirm,
      })
      await signIn(form.email, form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join('; '))
      } else {
        setError(detail || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f13] via-gf-dark to-[#1e5c3a] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gf-light/10 rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-gf-mid/10 rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gf-pale rounded-full flex items-center justify-center shadow-lg shadow-black/20">
              <span className="text-2xl">🌿</span>
            </div>
            <div className="text-left">
              <p className="text-white font-heading font-bold text-base leading-tight group-hover:text-gf-pale transition-colors">GreenField Farm Care</p>
              <p className="text-white/40 text-[10px] tracking-widest font-body">CUSTOMER PORTAL</p>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-7">
          <div className="mb-6">
            <h2 className="text-xl font-heading font-bold text-gf-dark">Create Customer Account</h2>
            <p className="text-gray-500 text-sm font-body mt-1">Register to request farm services and track your activities.</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg font-body">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Full Name *</label>
              <input required value={form.name} onChange={set('name')}
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>

            <div>
              <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Email Address *</label>
              <input required type="email" value={form.email} onChange={set('email')}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>

            <div>
              <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Phone Number</label>
              <input value={form.phone} onChange={set('phone')}
                placeholder="+91 98765 00000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
            </div>

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Password *</label>
              <div className="relative">
                <input required type={showPass ? 'text' : 'password'} minLength={6}
                  value={form.password} onChange={set('password')}
                  placeholder="Min 6 characters"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid" />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-body font-semibold text-gray-600 mb-1">Confirm Password *</label>
              <input required type="password" value={form.confirm} onChange={set('confirm')}
                placeholder="Re-enter your password"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-gf-mid
                  ${form.confirm && form.confirm !== form.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-red-500 text-xs mt-1 font-body">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (form.confirm.length > 0 && form.confirm !== form.password)}
              className="w-full bg-gf-dark text-white font-heading font-semibold py-3 rounded-xl hover:bg-gf-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-md mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-5 text-sm font-body text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-gf-mid font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link to="/" className="text-xs text-white/30 hover:text-white/60 font-body hover:underline">← Back to website</Link>
        </p>
      </div>
    </div>
  )
}
